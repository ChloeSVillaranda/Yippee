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
		case "submitAnswer":
			handleSubmitAnswer(conn, data)
		case "nextQuestion":
			handleNextQuestion(conn, data)
		default:
			log.Println("Unknown action:", data.Action)
		}
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
			notifyAllClientsInRoom(lobby, "Lobby updated")
			return
		}
	}
}
