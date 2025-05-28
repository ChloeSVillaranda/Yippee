// this file contains all the structs used throughout the project
package main

import "github.com/gorilla/websocket"

type Quiz struct {
	QuizName        string         `json:"quizName"`
	QuizDescription string         `json:"quizDescription"`
	CreatedBy       string         `json:"createdBy"`
	QuizQuestions   []QuizQuestion `json:"quizQuestions"`
}

type QuizQuestion struct {
	Question   string   `bson:"question"`
	Points     int      `bson:"points"`
	Difficulty int      `bson:"difficulty"`
	Hint       string   `bson:"hint"`
	Category   []string `bson:"category"`
	Options    []string `bson:"options"`
	Answer     int      `bson:"answer"`
}

// lobby structure
type Lobby struct {
	RoomCode        string                   `json:"roomCode, omitempty"`
	Quiz            Quiz                     `json:"quiz, omitempty"`
	ClientsInLobby  map[*websocket.Conn]User `json:"-"`                 // won't ever be sent to the FE
	Status          string                   `json:"status, omitempty"` //TODO: make an enum of Not Started, In-Progress, Finished
	Settings        Settings                 `json:"settings, omitempty"`
	CurrentQuestion QuizQuestion             `json:"currentQuestion, omitempty"`
}

type Settings struct {
	QuestionTime           int  `json:"questionTime, omitempty"` // TODO: figure out if infinite should be set to 0
	EnableMessages         bool `json:"enableMessages"`
	ShowMessagesDuringGame bool `json:"showMessagesDuringGame"`
	ShowLeaderboard        bool `json:"showLeaderboard"`
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
	MessageToClient string `json:"messageToClient"` // TODO: can remove if stable?
	Error           string `json:"error,omitempty"` // send error back to client if any
	Lobby           Lobby  `json:"lobby,omitempty"`
	ClientsInLobby  []User `json:"clientsInLobby,omitempty"`
}

type User struct {
	UserName    string `json:"userName"`
	UserMessage string `json:"userMessage,omitempty"`
	UserRole    string `json:"userRole,omitempty"`
	Points      int    `json:"points,omitempty"` // default as 0
}
