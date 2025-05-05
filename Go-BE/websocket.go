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

func main() {
	http.HandleFunc("/ws", handleConnection)
	go handleMessages()

	fmt.Println("WebSocket server running on ws://localhost:8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
