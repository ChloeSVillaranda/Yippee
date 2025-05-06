package main

import (
	"encoding/json"
	"log"
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
	RoomCode string                   `json:"roomCode"`
	QuizName string                   `json:"quizName"`
	Host     *websocket.Conn          `json:"-"`
	Clients  map[*websocket.Conn]bool `json:"-"`
}

// Message structure
type Message struct {
	Action   string `json:"action"`
	RoomCode string `json:"roomCode,omitempty"`
	QuizName string `json:"quizName,omitempty"`
	Message  string `json:"message,omitempty"`
	Error    string `json:"error,omitempty"`
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
			break
		}

		var data Message
		if err := json.Unmarshal(message, &data); err != nil {
			log.Println("Error unmarshalling message:", err)
			continue
		}

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

// Handle lobby creation
func handleCreateLobby(conn *websocket.Conn, data Message) {
	mutex.Lock()
	defer mutex.Unlock()

	// Create a new lobby
	lobbies[data.RoomCode] = &Lobby{
		RoomCode: data.RoomCode,
		QuizName: data.QuizName,
		Host:     conn,
		Clients:  make(map[*websocket.Conn]bool),
	}

	log.Printf("Lobby created: %+v\n", lobbies[data.RoomCode])

	// Notify the host that the lobby was created
	conn.WriteJSON(Message{
		Action:   "createLobby",
		Message:  "Lobby created successfully",
		RoomCode: data.RoomCode,
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

	// Add the client to the lobby
	lobby.Clients[conn] = true
	log.Printf("Client joined lobby: %s\n", data.RoomCode)

	// Notify the client that they joined successfully
	conn.WriteJSON(Message{
		Action:   "joinLobby",
		Message:  "Joined lobby successfully",
		RoomCode: data.RoomCode,
	})

	// Notify the host that a new client joined
	if lobby.Host != nil {
		lobby.Host.WriteJSON(Message{
			Action:  "joinLobby",
			Message: "A new player has joined the lobby",
		})
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
