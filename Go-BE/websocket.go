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

// Lobby structure
type Lobby struct {
	RoomCode       string                   `json:"-"`
	Quiz           Quiz                     `json:"quiz"`
	ClientsInLobby map[*websocket.Conn]User `json:"-"` // Map of clients to their player info
}

// Message structure
// Json requests (sent by client to server)
type MessageRequest struct {
	Action   string `json:"action"` // requested action client wants to carry out
	User     User   `json:"user"`   // user who makes the request
	RoomCode string `json:"roomCode,omitempty"`
	Quiz     Quiz   `json:"quiz,omitempty"` // TODO: need to send the quiz id for the backend to retrieve from dB
}

// Json responses (sent by server to client)
type MessageResponse struct {
	RoomCode        string `json:"roomCode,omitempty"`
	MessageToClient string `json:"messageToClient"` // TODO: can remove if stable?
	Quiz            Quiz   `json:"quiz,omitempty"`  // TODO: remove, temporarily a string
	Error           string `json:"error,omitempty"` // send error back to client if any
	ClientsInLobby  []User `json:"clientsInLobby,omitempty"`
}

type User struct {
	UserName    string `json:"userName"`
	UserMessage string `json:"userMessage,omitempty"`
	UserRole    string `json:"userRole,omitempty"`
	Points      int    `json:"points,omitempty"` // default as 0
}

// Handle WebSocket connections
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
		RoomCode:       roomCode,
		Quiz:           data.Quiz,
		ClientsInLobby: make(map[*websocket.Conn]User),
	}

	// add host as part of ClientsInLobby
	lobbies[roomCode].ClientsInLobby[conn] = User{
		UserName:    data.User.UserName,
		UserMessage: data.User.UserMessage,
		UserRole:    data.User.UserRole,
	}

	log.Printf("Lobby created: %+v\n", lobbies[roomCode])

	// Send info back to the host
	conn.WriteJSON(MessageResponse{
		MessageToClient: "Lobby created successfully",
		Quiz:            lobbies[roomCode].Quiz,
		RoomCode:        roomCode,
	})
}

// Handle joining a lobby, will be joined as a player
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
		Quiz:            lobby.Quiz, //TODO return quiz details
		RoomCode:        data.RoomCode,
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
