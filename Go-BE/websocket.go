package main

import (
	"encoding/json"
	// "fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*websocket.Conn]bool)
	broadcast = make(chan Message)
	mutex     = sync.Mutex{}
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Message structure
type Message struct {
	Type    string `json:"type"`
	Message string `json:"message,omitempty"`
}

// Reverses a string
func reverseString(input string) string {
	runes := []rune(input)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

// WebSocket handler
func handleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()

	log.Println("New WebSocket connection established.")

	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket disconnected.")
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			break
		}

		var msg Message
		err = json.Unmarshal(msgBytes, &msg)
		if err != nil {
			log.Println("Invalid message format.")
			continue
		}

		// Reverse the message and send it back
		if msg.Type == "reverse" {
			reversedMessage := reverseString(msg.Message)
			response := Message{
				Type:    "reversed",
				Message: reversedMessage,
			}

			err = conn.WriteJSON(response)
			if err != nil {
				log.Println("Error sending reversed message:", err)
				mutex.Lock()
				delete(clients, conn)
				mutex.Unlock()
				break
			}
		}
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		mutex.Lock()
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Println("Error sending message:", err)
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}

// func main() {
// 	http.HandleFunc("/ws", handleConnection)
// 	go handleMessages()

// 	fmt.Println("WebSocket server running on ws://localhost:8080/ws")
// 	log.Fatal(http.ListenAndServe(":8080", nil))
// }

type Lobby struct {
	RoomCode string                   `json:"roomCode"`
	QuizName string                   `json:"quizName"`
	Host     *websocket.Conn          `json:"-"`
	Clients  map[*websocket.Conn]bool `json:"-"`
}

var lobbies = make(map[string]*Lobby)

// Handle WebSocket connections
func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	// Read the initial message to determine the action
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Println("Error reading message:", err)
		return
	}

	var data map[string]interface{}
	if err := json.Unmarshal(message, &data); err != nil {
		log.Println("Error unmarshalling message:", err)
		return
	}

	action, ok := data["action"].(string)
	if !ok {
		log.Println("Invalid action")
		return
	}

	// handle all message types here
	switch action {
	case "createLobby":
		handleCreateLobby(conn, data)
	case "joinLobby":
		handleJoinLobby(conn, data)
	default:
		log.Println("Unknown action:", action)
	}
}

// handle lobby creation
func handleCreateLobby(conn *websocket.Conn, data map[string]interface{}) {
	roomCode := data["roomCode"].(string)
	quizName := data["quizName"].(string)

	// create a new lobby
	lobbies[roomCode] = &Lobby{
		RoomCode: roomCode,
		QuizName: quizName,
		Host:     conn,
		Clients:  make(map[*websocket.Conn]bool),
	}

	log.Printf("Lobby created: %+v\n", lobbies[roomCode])

	// notify the host that the lobby was created
	conn.WriteJSON(map[string]string{
		"message":  "Lobby created successfully",
		"roomCode": roomCode,
	})
}

// handle joining a lobby
func handleJoinLobby(conn *websocket.Conn, data map[string]interface{}) {
	roomCode := data["roomCode"].(string)

	lobby, exists := lobbies[roomCode]
	if !exists {
		conn.WriteJSON(map[string]string{
			"error": "Lobby not found",
		})
		return
	}

	// add the client to the lobby
	lobby.Clients[conn] = true
	log.Printf("Client joined lobby: %s\n", roomCode)

	// notify the client that they joined successfully
	conn.WriteJSON(map[string]string{
		"message":  "Joined lobby successfully",
		"roomCode": roomCode,
	})

	// Notify the host that a new client joined
	lobby.Host.WriteJSON(map[string]string{
		"message": "A new player has joined the lobby",
	})
}
