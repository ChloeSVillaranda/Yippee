package main

import (
	"encoding/json"
	"fmt"
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
	RoomCode string                     `json:"-"`
	QuizName string                     `json:"quizName"`
	Host     *websocket.Conn            `json:"-"`
	Clients  map[*websocket.Conn]Player `json:"-"` // Map of clients to their player info
}

// Message structure
type Message struct {
	Action     string   `json:"action"`
	RoomCode   string   `json:"roomCode,omitempty"`
	QuizName   string   `json:"quizName,omitempty"`
	Message    string   `json:"message,omitempty"`
	Error      string   `json:"error,omitempty"`
	Role       string   `json:"role,omitempty"`
	PlayerName string   `json:"playerName,omitempty"`
	Players    []Player `json:"players,omitempty"`
	Host       Host     `json:"host,omitempty"`
}

// Player structure
type Player struct {
	PlayerName string `json:"playerName"`
}

// Host structure
type Host struct {
	HostName string `json:"hostName"`
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

		var data Message
		if err := json.Unmarshal(message, &data); err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

		// Handle WebSocket actions
		switch data.Action {
		case "createLobby":
			handleCreateLobby(conn, data)
		case "joinLobby":
			handleJoinLobby(conn, data)
		case "validateRoom":
			handleValidateRoom(conn, data)
		default:
			log.Println("Unknown action:", data.Action)
		}
	}
}

// Handle creating a lobby
func handleCreateLobby(conn *websocket.Conn, data Message) {
	mutex.Lock()
	defer mutex.Unlock()

	// Generate a random room code (4 letters)
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
	fmt.Println("The roomCode is defined as:", roomCode)

	// Create a new lobby
	lobbies[roomCode] = &Lobby{
		RoomCode: roomCode,
		QuizName: data.QuizName,
		Host:     conn,
		Clients:  make(map[*websocket.Conn]Player),
	}

	log.Printf("Lobby created: %+v\n", lobbies[roomCode])

	// Send info back to the host
	conn.WriteJSON(Message{
		Action:   "createLobby",
		Message:  "Lobby created successfully",
		RoomCode: roomCode,
		Role:     "host",
	})
}

// Handle joining a lobby
func handleJoinLobby(conn *websocket.Conn, data Message) {
	mutex.Lock()
	defer mutex.Unlock()

	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(Message{
			Action: "joinLobby",
			Error:  "Lobby not found",
		})
		return
	}

	// Determine the role of the joining connection
	var role string
	if lobby.Host == conn {
		role = "host"
	} else {
		role = "player"
		lobby.Clients[conn] = Player{PlayerName: data.PlayerName} // Add the client to the lobby
		log.Printf("Client joined lobby: %s with name: %s\n", data.RoomCode, data.PlayerName)
	}

	// Prepare the list of connected players
	players := []Player{}
	for _, player := range lobby.Clients {
		players = append(players, player)
	}

	// Include the host in the response
	host := Host{
		HostName: "Host", // Replace with actual host name if available
	}

	// Send the role back to the joining client and who is in the lobby
	conn.WriteJSON(Message{
		Action:   "joinLobby",
		Message:  "Joined lobby successfully",
		RoomCode: data.RoomCode,
		Role:     role,
		Players:  players,
		Host:     host,
	})

	// Notify all clients (including the host) about the updated list of players
	notifyLobbyClients(lobby)
}

// Notify all clients in the lobby about the current state of the lobby
func notifyLobbyClients(lobby *Lobby) {
	// Prepare the list of connected players
	players := []Player{}
	for _, player := range lobby.Clients {
		players = append(players, player)
	}

	// Include the host in the response
	host := Host{
		HostName: "Host", // Replace with actual host name if available
	}

	// Broadcast the updated lobby state to all clients
	message := Message{
		Action:   "updateLobby",
		Message:  "Lobby updated",
		RoomCode: lobby.RoomCode,
		QuizName: lobby.QuizName,
		Players:  players,
		Host:     host,
	}

	// Send the message to all clients
	if lobby.Host != nil {
		lobby.Host.WriteJSON(message)
	}
	for client := range lobby.Clients {
		client.WriteJSON(message)
	}
}

// Handle room validation
func handleValidateRoom(conn *websocket.Conn, data Message) {
	mutex.Lock()
	defer mutex.Unlock()

	_, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(Message{
			Action: "validateRoom",
			Error:  "Room not found",
		})
		return
	}

	// Notify the client that the room exists
	conn.WriteJSON(Message{
		Action:   "validateRoom",
		Message:  "Room exists",
		RoomCode: data.RoomCode,
	})
}

// Remove a connection from the lobby
func removeConnectionFromLobby(conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	for roomCode, lobby := range lobbies {
		if lobby.Host == conn {
			// If the host disconnects, remove the entire lobby
			delete(lobbies, roomCode)
			log.Printf("Lobby %s removed because the host disconnected.", roomCode)
			return
		}

		if _, exists := lobby.Clients[conn]; exists {
			// Remove the client from the lobby
			delete(lobby.Clients, conn)
			log.Printf("Client disconnected from lobby: %s", roomCode)

			// Notify remaining clients about the updated lobby state
			notifyLobbyClients(lobby)
			return
		}
	}
}
