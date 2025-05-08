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
	RoomCode string                   `json:"-"`
	QuizName string                   `json:"quizName"`
	Host     *websocket.Conn          `json:"-"`
	Clients  map[*websocket.Conn]bool `json:"-"`
}

// Message structure
type Message struct {
	Action   string   `json:"action"`
	RoomCode string   `json:"roomCode,omitempty"`
	QuizName string   `json:"quizName,omitempty"`
	Message  string   `json:"message,omitempty"`
	Error    string   `json:"error,omitempty"`
	Role     string   `json:"role,omitempty"`
	Players  []string `json:"players,omitempty"`
	Host     string   `json:"host,omitempty"`
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

		// define all websocket commands
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

func handleCreateLobby(conn *websocket.Conn, data Message) {
	mutex.Lock()
	defer mutex.Unlock()

	// Create random room code (4 letters)
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

	// Create a new lobby room
	lobbies[roomCode] = &Lobby{
		RoomCode: roomCode,
		QuizName: data.QuizName,
		Host:     conn,
		Clients:  make(map[*websocket.Conn]bool),
	}

	log.Printf("Lobby created: %+v\n", lobbies[roomCode])

	// Send info back to client
	conn.WriteJSON(Message{
		Action:   "createLobby",
		Message:  "Lobby created successfully",
		RoomCode: roomCode,
		Role:     "host",
	})
}

// Joins an existing lobby by sending the room code
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
		lobby.Clients[conn] = true // Add the client to the lobby
		log.Printf("Client joined lobby: %s\n", data.RoomCode)
	}

	// Send the role back to the joining client
	conn.WriteJSON(Message{
		Action:   "joinLobby",
		Message:  "Joined lobby successfully",
		RoomCode: data.RoomCode,
		Role:     role,
	})

	// Notify all clients (including the host) about the updated list of players
	notifyLobbyClients(lobby)
}

// Notify all clients in the lobby about the current state of the lobby
func notifyLobbyClients(lobby *Lobby) {
	// Prepare the list of connected players
	players := []string{}
	for client := range lobby.Clients {
		players = append(players, client.RemoteAddr().String())
	}

	// Include the host in the list
	host := ""
	if lobby.Host != nil {
		host = lobby.Host.RemoteAddr().String()
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
