package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// WebSocket handler
func handleConnection(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer conn.Close()

	// Wait for the client to send the client ID
	_, clientID, err := conn.ReadMessage()
	if err != nil {
		log.Println(err)
		return
	}

	// Log the client ID (sent by the frontend)
	log.Printf("%s connected\n", string(clientID))

	// Listen for messages from the client
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		log.Printf("%s: %s\n", clientID, message)
	}
}

func main() {
	http.HandleFunc("/ws", handleConnection)
	fmt.Println("WebSocket server running on ws://localhost:8080/ws")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
