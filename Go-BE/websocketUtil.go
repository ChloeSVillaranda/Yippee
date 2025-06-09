package main

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/gorilla/websocket"
)

// TODO: would it be better to implement this??
//
//	func verifyLobby(lobby *Lobby, ) {
//		// check if the lobby exists
//		lobby, exists := lobbies[data.RoomCode]
//		if !exists {
//			conn.WriteJSON(MessageResponse{
//				Error: "Lobby not found",
//			})
//			return
//		}
//	}
func getConnectedClients(lobby *Lobby) []User {
	// TODO: make as util function
	connectedClients := []User{}
	for _, client := range lobby.ClientsInLobby {
		connectedClients = append(connectedClients, client)
	}

	return connectedClients
}

// send a message to all clients in a room
func notifyAllClientsInRoom(lobby *Lobby, messageToSendOut string) {
	// TODO: figure out a way to make this less redundant
	connectedClients := getConnectedClients(lobby)

	// Notify all clients in the lobby that the game has started
	message := MessageResponse{
		MessageToClient: messageToSendOut,
		Lobby:           *lobby,
		ClientsInLobby:  connectedClients,
	}

	for client := range lobby.ClientsInLobby {
		client.WriteJSON(message)
	}
}

// PrepareQuizOptions combines correct and incorrect answers into options field
func prepareQuizOptions(quiz *Quiz) {
	for i := range quiz.QuizQuestions {
		question := &quiz.QuizQuestions[i]

		// initialize options slice with capacity of total answers
		totalAnswers := len(question.CorrectAnswers) + len(question.IncorrectAnswers)
		question.Options = make([]string, 0, totalAnswers)

		// combine correct and incorrect answers
		question.Options = append(question.Options, question.CorrectAnswers...)
		question.Options = append(question.Options, question.IncorrectAnswers...)

		// shuffle options
		r := rand.New(rand.NewSource(time.Now().UnixNano()))
		r.Shuffle(len(question.Options), func(i, j int) {
			question.Options[i], question.Options[j] = question.Options[j], question.Options[i]
		})
	}
}

// helper function to validate lobby and user
func validateLobbyAndUser(conn *websocket.Conn, roomCode string, requiredRole string) (*Lobby, *User, error) {
	lobby, exists := lobbies[roomCode]
	if !exists {
		return nil, nil, fmt.Errorf("Lobby not found")
	}

	user, exists := lobby.ClientsInLobby[conn]
	if !exists || user.UserRole != requiredRole {
		return nil, nil, fmt.Errorf("Only %s can perform this action", requiredRole)
	}

	return lobby, &user, nil
}

// Helper function to check if two string slices have the same elements
func stringSlicesEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	// Create maps for O(1) lookup
	aMap := make(map[string]bool)
	bMap := make(map[string]bool)

	// Add all elements to maps
	for _, val := range a {
		aMap[val] = true
	}
	for _, val := range b {
		if !aMap[val] {
			return false
		}
		bMap[val] = true
	}

	// Check if all elements in a are in b
	for val := range aMap {
		if !bMap[val] {
			return false
		}
	}
	return true
}
