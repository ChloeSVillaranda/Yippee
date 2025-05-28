package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	lobbies  = make(map[string]*Lobby) // Stores active lobbies
	mutex    = sync.Mutex{}            // Ensures thread-safe access to lobbies
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

// handle WebSocket connections
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			removeConnectionFromLobby(conn)
			break
		}

		var data MessageRequest
		if err := json.Unmarshal(message, &data); err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

		// websocket actions that the client can request
		switch data.Action {
		case "createLobby":
			handleCreateLobby(conn, data)
		case "joinLobby":
			handleJoinLobby(conn, data)
		case "sendLobbyMessage":
			handleSendLobbyMessage(conn, data)
		case "startGame":
			handleStartGame(conn, data)
		default:
			log.Println("Unknown action:", data.Action)
		}
	}
}

// handle creating a lobby (done by host connection)
func handleCreateLobby(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// generate a random room code (4 letters)
	// TODO: optimize??
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	var roomCode string
	for {
		roomCodeRunes := make([]rune, 4)
		for i := range roomCodeRunes {
			roomCodeRunes[i] = chars[rand.Intn(len(chars))]
		}
		roomCode = string(roomCodeRunes)

		if _, exists := lobbies[roomCode]; !exists {
			break
		}
	}

	log.Println("Created a new room:", roomCode)

	// create a new lobby
	lobbies[roomCode] = &Lobby{
		RoomCode:        roomCode,
		Quiz:            data.Quiz,
		ClientsInLobby:  make(map[*websocket.Conn]User),
		Status:          "Waiting",
		CurrentQuestion: data.Quiz.QuizQuestions[0], // TODO: if shuffled (in settings), the current question will be different
	}

	// add host as part of ClientsInLobby
	lobbies[roomCode].ClientsInLobby[conn] = User{
		UserName:    data.User.UserName,
		UserMessage: data.User.UserMessage,
		UserRole:    data.User.UserRole,
	}

	log.Printf("Lobby created: %+v\n", lobbies[roomCode])

	// send info back to the host
	conn.WriteJSON(MessageResponse{
		MessageToClient: "Lobby created successfully",
		// Lobby: Lobby{
		// 	RoomCode: roomCode,
		// 	Quiz:     lobbies[roomCode].Quiz,
		// 	Status:   lobbies[roomCode].Status,
		// },
		Lobby: *lobbies[roomCode], // send back the created lobby information
	})
}

// handle joining a lobby, will be joined as a player
func handleJoinLobby(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			MessageToClient: "handleJoinLobby failed",
			Error:           "Lobby not found",
		})
		return
	}

	// add player to the lobby
	lobby.ClientsInLobby[conn] = User{
		UserName:    data.User.UserName,
		UserMessage: data.User.UserMessage,
		UserRole:    data.User.UserRole,
	}

	log.Printf("Client joined lobby: %s with name: %s\n", data.RoomCode, data.User.UserName)

	// prepare the list of connected players by typecasting it first
	connectedClients := []User{}
	for _, client := range lobby.ClientsInLobby {
		connectedClients = append(connectedClients, client)
	}

	// send the quiz details back to the client + who is already connected
	conn.WriteJSON(MessageResponse{
		MessageToClient: "Joined lobby successfully",
		Lobby:           *lobby,
		ClientsInLobby:  connectedClients,
	})

	// notify all clients about the updated list of players
	notifyLobbyClients(lobby)
}

// notify all clients in the lobby about the current state of the lobby
// aka if user joins or points gets updated
func notifyLobbyClients(lobby *Lobby) {
	// prepare the list of connected players by typecasting it first
	connectedClients := []User{}
	for _, client := range lobby.ClientsInLobby {
		connectedClients = append(connectedClients, client)
	}

	// broadcast the updated lobby state to all clients
	message := MessageResponse{
		MessageToClient: "Lobby updated",
		ClientsInLobby:  connectedClients,
	}

	for client := range lobby.ClientsInLobby {
		client.WriteJSON(message)
	}
}

// remove a connection from the lobby
func removeConnectionFromLobby(conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	for roomCode, lobby := range lobbies {
		// check if the connection is the host
		if host, exists := lobby.ClientsInLobby[conn]; exists && host.UserRole == "host" {
			// if the host disconnects,  delete the entire lobby
			delete(lobbies, roomCode)
			log.Printf("Lobby %s removed because the host disconnected.", roomCode)
			return
		}

		// Check if the connection is a client
		if _, exists := lobby.ClientsInLobby[conn]; exists {
			// Remove the client from the lobby
			delete(lobby.ClientsInLobby, conn)
			log.Printf("Client disconnected from lobby: %s", roomCode)

			// Notify remaining clients about the updated lobby state
			notifyLobbyClients(lobby)
			return
		}
	}
}

// handler for dealing when a user sends a message
func handleSendLobbyMessage(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// check if player in connected lobby
	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Lobby not found",
		})
		return
	}

	user, exists := lobby.ClientsInLobby[conn]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Player not found in the lobby",
		})
		return
	}

	// update the player's message
	user.UserMessage = data.User.UserMessage
	lobby.ClientsInLobby[conn] = user // update the map

	log.Printf("Player %s sent message: %s\n", data.User.UserName, data.User.UserMessage)

	// notify all clients in the lobby about the updated state
	notifyLobbyClients(lobby)
}

// handler for dealing when a host starts a game
func handleStartGame(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// check if the lobby exists
	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Lobby not found",
		})
		return
	}

	// check if user exists in lobby and is the host
	user, exists := lobby.ClientsInLobby[conn]
	if !exists || user.UserRole != "host" {
		conn.WriteJSON(MessageResponse{
			Error: "Only the host can start the game",
		})
		return
	}

	// update lobby status
	lobby.Status = "In-Progress"
	log.Printf("Game started in lobby: %s by host: %s\n", data.RoomCode, user.UserName)

	// update lobby in the global map
	lobbies[data.RoomCode] = lobby

	// Notify all clients in the lobby that the game has started
	message := MessageResponse{
		MessageToClient: "Game start",
		Lobby:           *lobby,
	}

	for client := range lobby.ClientsInLobby {
		client.WriteJSON(message)
	}
}
