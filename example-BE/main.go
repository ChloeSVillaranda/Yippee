package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*websocket.Conn]bool) // Active WebSocket connections
	users     = make(map[string]bool)          // Users who "joined" the game
	broadcast = make(chan Message)             // Broadcast channel
	mutex     = sync.Mutex{}                   // Prevent race conditions
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Message structure
type Message struct {
	Type string   `json:"type"`
	ID   string   `json:"id,omitempty"`
	IDs  []string `json:"ids,omitempty"` // List of all users in the game
}

// WebSocket handler
func handleConnection(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	// Register WebSocket connection
	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()

	log.Println("New WebSocket connection established.")

	// Listen for messages
	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket disconnected.")
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			break
		}

		// Parse incoming message
		var msg Message
		err = json.Unmarshal(msgBytes, &msg)
		if err != nil {
			log.Println("Invalid message format.")
			continue
		}

		mutex.Lock()
		if msg.Type == "join" {
			users[msg.ID] = true
			broadcast <- Message{Type: "update-users", IDs: getUserList()}
		} else if msg.Type == "leave" {
			delete(users, msg.ID)
			broadcast <- Message{Type: "update-users", IDs: getUserList()}
		}
		mutex.Unlock()
	}
}

// Get all joined users
func getUserList() []string {
	userList := []string{}
	for id := range users {
		userList = append(userList, id)
	}
	return userList
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

func main() {
	http.HandleFunc("/ws", handleConnection)
	go handleMessages()

	fmt.Println("WebSocket server running on ws://localhost:8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
