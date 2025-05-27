// this file contains all the structs used throughout the project
package main

import "github.com/gorilla/websocket"

type Quiz struct {
	QuizName        string          `json:"quizName"`
	QuizDescription string          `json:"quizDescription"`
	CreatedBy       string          `json:"createdBy"`
	QuizQuestions   []QuizQuestions `json:"quizQuestions"`
}

type QuizQuestions struct {
	Question   string   `bson:"question"`
	Points     int      `bson:"points"`
	Difficulty int      `bson:"difficulty"`
	Hint       string   `bson:"hint"`
	Category   []string `bson:"category"`
	Options    []string `bson:"options"`
	Answer     int      `bson:"answer"`
}

// Lobby structure
type Lobby struct {
	RoomCode       string                   `json:"-"`
	Quiz           Quiz                     `json:"quiz"`
	ClientsInLobby map[*websocket.Conn]User `json:"-"` // Map of clients to their player info
}

// Message structure
// Json requests (sent by client to server)
type MessageRequest struct {
	Action   string `json:"action"` // requested action client wants to carry out
	User     User   `json:"user"`   // user who makes the request
	RoomCode string `json:"roomCode,omitempty"`
	Quiz     Quiz   `json:"quiz,omitempty"` // TODO: need to send the quiz id for the backend to retrieve from dB
}

// Json responses (sent by server to client)
type MessageResponse struct {
	RoomCode        string `json:"roomCode,omitempty"`
	MessageToClient string `json:"messageToClient"` // TODO: can remove if stable?
	Quiz            Quiz   `json:"quiz,omitempty"`  // TODO: remove, temporarily a string
	Error           string `json:"error,omitempty"` // send error back to client if any
	ClientsInLobby  []User `json:"clientsInLobby,omitempty"`
}

type User struct {
	UserName    string `json:"userName"`
	UserMessage string `json:"userMessage,omitempty"`
	UserRole    string `json:"userRole,omitempty"`
	Points      int    `json:"points,omitempty"` // default as 0
}
