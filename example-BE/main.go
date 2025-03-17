package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*websocket.Conn]string) // Connected clients
	broadcast = make(chan Message)               // Broadcast channel
	mutex     = sync.Mutex{}                     // To prevent race conditions
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Message defines the structure of messages sent to clients
type Message struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

// WebSocket handler
func handleConnection(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	// Wait for the client to send their ID
	_, clientID, err := conn.ReadMessage()
	if err != nil {
		log.Println("Error reading client ID:", err)
		return
	}

	// Register the client
	mutex.Lock()
	clients[conn] = string(clientID)
	mutex.Unlock()

	log.Printf("Client %s connected\n", clientID)

	// Notify all clients about the new connection
	broadcast <- Message{Type: "new-client", ID: string(clientID)}

	// Listen for messages from the client
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Client %s disconnected\n", clientID)
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()

			// Notify all clients about the disconnection
			broadcast <- Message{Type: "client-left", ID: string(clientID)}
			break
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
				log.Printf("Error sending message: %v", err)
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
