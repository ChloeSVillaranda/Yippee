// this file contains all the structs used throughout the project
package main

import (
	"time"

	"github.com/gorilla/websocket"
)

type Quiz struct {
	QuizName        string         `json:"quizName"`
	QuizDescription string         `json:"quizDescription"`
	CreatedBy       string         `json:"createdBy"`
	QuizQuestions   []QuizQuestion `json:"quizQuestions"`
}

type QuizQuestion struct {
	Question   string   `json:"question"`
	Points     int      `json:"points"`
	Difficulty int      `json:"difficulty"`
	Hint       string   `json:"hint"`
	Category   []string `json:"category"`
	Options    []string `json:"options"`
	Answer     int      `json:"answer"`
}

// lobby structure
type Lobby struct {
	RoomCode             string                   `json:"roomCode,omitempty"`
	Quiz                 Quiz                     `json:"-"`
	ClientsInLobby       map[*websocket.Conn]User `json:"-"`                // won't ever be sent to the FE
	Status               string                   `json:"status,omitempty"` //TODO: make an enum of Not Started, In-Progress, Finished
	Settings             Settings                 `json:"settings,omitempty"`
	CurrentQuestionIndex int                      `json:"currentQuestionIndex,omitempty"`
	CurrentQuestion      QuizQuestion             `json:"currentQuestion,omitempty"`
	Timer                *time.Timer              `json:"-"`                       // keep timer on backend
	TimeRemaining        int                      `json:"timeRemaining,omitempty"` // send remaining time to clients
}

type Settings struct {
	QuestionTime           int  `json:"questionTime,omitempty"` // TODO: figure out if infinite should be set to 0 and if the timer should be kept on backend
	EnableMessages         bool `json:"enableMessages"`
	ShowMessagesDuringGame bool `json:"showMessagesDuringGame"`
	ShowLeaderboard        bool `json:"showLeaderboard"`
	ShuffleQuestions       bool `json:"-"`
}

// Message structure
// Json requests (sent by client to server)
type MessageRequest struct {
	Action   string `json:"action"` // requested action client wants to carry out
	User     User   `json:"user"`   // user who makes the request
	RoomCode string `json:"roomCode,omitempty"`
	Quiz     Quiz   `json:"quiz,omitempty"`   // TODO: need to send the quiz id for the backend to retrieve from dB
	Answer   int    `json:"answer,omitempty"` // plays submit an int as an answer to a question
}

// Json responses (sent by server to client)
type MessageResponse struct {
	MessageToClient string `json:"messageToClient"` // TODO: can remove if stable?
	Error           string `json:"error,omitempty"` // send error back to client if any
	Lobby           Lobby  `json:"lobby,omitempty"`
	ClientsInLobby  []User `json:"clientsInLobby,omitempty"`
}

type User struct {
	UserName        string `json:"userName"`
	UserMessage     string `json:"userMessage,omitempty"`
	UserRole        string `json:"userRole,omitempty"`
	Points          int    `json:"points,omitempty"` // default as 0
	SubmittedAnswer bool   `json:"submittedAnswer,omitempty"`
}
