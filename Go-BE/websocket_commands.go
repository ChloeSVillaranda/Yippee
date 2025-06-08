package main

import (
	"log"
	"math/rand"

	"github.com/gorilla/websocket"
)

// handle creating a lobby (done by host connection)
func handleCreateLobby(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// generate a random room code (4 letters)
	// TODO: optimize??
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	var roomCode string
	for {
		roomCodeRunes := make([]rune, 4)
		for i := range roomCodeRunes {
			roomCodeRunes[i] = chars[rand.Intn(len(chars))]
		}
		roomCode = string(roomCodeRunes)

		if _, exists := lobbies[roomCode]; !exists {
			break
		}
	}

	log.Println("Created a new room:", roomCode)

	prepareQuizOptions(&data.Quiz)

	// create a new lobby
	lobbies[roomCode] = &Lobby{
		RoomCode:             roomCode,
		Quiz:                 data.Quiz,
		ClientsInLobby:       make(map[*websocket.Conn]User),
		Status:               "Waiting",
		CurrentQuestionIndex: 0,
		CurrentQuestion:      data.Quiz.QuizQuestions[0], // TODO: if shuffled (in settings), the current question will be different
	}

	// add host as part of ClientsInLobby
	lobbies[roomCode].ClientsInLobby[conn] = User{
		UserName:    data.User.UserName,
		UserMessage: data.User.UserMessage,
		UserRole:    data.User.UserRole,
	}

	log.Printf("Lobby created: %+v\n", lobbies[roomCode])

	connectedClients := getConnectedClients(lobbies[roomCode]) // TODO: might not need to get all the clients, because it is just host at the moment

	// send info back to the host
	conn.WriteJSON(MessageResponse{
		MessageToClient: "Lobby created",
		Lobby:           *lobbies[roomCode], // send back the created lobby information
		ClientsInLobby:  connectedClients,
	})
}

// handle joining a lobby, will be joined as a player
func handleJoinLobby(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			MessageToClient: "handleJoinLobby failed",
			Error:           "Lobby not found",
		})
		return
	}

	// add player to the lobby
	lobby.ClientsInLobby[conn] = User{
		UserName:    data.User.UserName,
		UserMessage: data.User.UserMessage,
		UserRole:    data.User.UserRole,
	}

	log.Printf("Client joined lobby: %s with name: %s\n", data.RoomCode, data.User.UserName)

	// prepare the list of connected players by typecasting it first
	connectedClients := getConnectedClients(lobby)

	// send the quiz details back to the client + who is already connected
	conn.WriteJSON(MessageResponse{
		MessageToClient: "Joined lobby",
		Lobby:           *lobby,
		ClientsInLobby:  connectedClients,
	})

	// notify all clients about the updated list of players
	notifyAllClientsInRoom(lobby, "Lobby updated")
}

// handler for dealing when a user sends a message
func handleSendLobbyMessage(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// check if player in connected lobby
	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Lobby not found",
		})
		return
	}

	user, exists := lobby.ClientsInLobby[conn]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Player not found in the lobby",
		})
		return
	}

	// update the player's message
	user.UserMessage = data.User.UserMessage
	lobby.ClientsInLobby[conn] = user // update the map

	log.Printf("Player %s sent message: %s\n", data.User.UserName, data.User.UserMessage)

	// notify all clients in the lobby about the updated state
	notifyAllClientsInRoom(lobby, "Lobby updated")
}

// handler for dealing when a host starts a game
func handleStartGame(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// check if the lobby exists
	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Lobby not found",
		})
		return
	}

	// check if user exists in lobby and is the host
	user, exists := lobby.ClientsInLobby[conn]
	if !exists || user.UserRole != "host" {
		conn.WriteJSON(MessageResponse{
			Error: "Only the host can start the game",
		})
		return
	}

	// update lobby status
	lobby.Status = "In-Progress"
	log.Printf("Game started in lobby: %s by host: %s\n", data.RoomCode, user.UserName)

	// update lobby in the global map
	lobbies[data.RoomCode] = lobby

	notifyAllClientsInRoom(lobby, "Game start")
}

// handler for dealing with answers
func handleSubmitAnswer(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	log.Printf("Received answer submission. Room: %s, User: %s", data.RoomCode, data.User.UserName)
	log.Printf("Submitted answers: %v", data.Answer)

	// check if the lobby exists
	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Lobby not found",
		})
		return
	}

	log.Printf("Current question correct answers: %v", lobby.CurrentQuestion.CorrectAnswers)

	// check if user exists in lobby and is a player
	user, exists := lobby.ClientsInLobby[conn]
	if !exists || user.UserRole != "player" {
		conn.WriteJSON(MessageResponse{
			Error: "Player unable to submit answer",
		})
		return
	}

	log.Printf("Comparing answers - Submitted: %v, Correct: %v", data.Answer, lobby.CurrentQuestion.CorrectAnswers)
	if stringSlicesEqual(data.Answer, lobby.CurrentQuestion.CorrectAnswers) {
		if user.SubmittedAnswer {
			conn.WriteJSON(MessageResponse{
				Error: "Player already submitted answer",
			})
			return
		}
		user.Points += lobby.CurrentQuestion.Points
		log.Printf("✅ %s answered correctly! New score: %d points\n", user.UserName, user.Points)
	} else {
		log.Printf("❌ %s answered incorrectly. Submitted: %v, Expected: %v",
			user.UserName, data.Answer, lobby.CurrentQuestion.CorrectAnswers)
		log.Printf("Current score: %d points\n", user.Points)
	}

	user.SubmittedAnswer = true

	// update the lobby with the updated points
	lobbies[data.RoomCode].ClientsInLobby[conn] = user

	notifyAllClientsInRoom(lobbies[data.RoomCode], "Lobby updated")
}

// display the points
func handleShowLeaderboard(conn *websocket.Conn, data MessageRequest) {

}

// handler for dealing with answers
func handleNextQuestion(conn *websocket.Conn, data MessageRequest) {
	mutex.Lock()
	defer mutex.Unlock()

	// check if the lobby exists
	lobby, exists := lobbies[data.RoomCode]
	if !exists {
		conn.WriteJSON(MessageResponse{
			Error: "Lobby not found",
		})
		return
	}

	// check if user exists in lobby and is a host (fixed role check)
	user, exists := lobby.ClientsInLobby[conn]
	if !exists || user.UserRole != "host" {
		conn.WriteJSON(MessageResponse{
			Error: "Only host can advance to next question",
		})
		return
	}

	// check if we've reached the end of questions
	if lobby.CurrentQuestionIndex >= len(lobby.Quiz.QuizQuestions)-1 {
		lobby.Status = "Completed"
		lobbies[data.RoomCode] = lobby
		notifyAllClientsInRoom(lobby, "Game completed")
		return
	}

	// advance to next question by incrementing the current question index
	lobby.CurrentQuestionIndex++
	lobby.CurrentQuestion = lobby.Quiz.QuizQuestions[lobby.CurrentQuestionIndex]

	// reset submittedAnswer status for all players
	for client, clientData := range lobby.ClientsInLobby {
		if clientData.UserRole == "player" {
			clientData.SubmittedAnswer = false
			lobby.ClientsInLobby[client] = clientData
		}
	}

	// Update lobby in global map
	lobbies[data.RoomCode] = lobby

	notifyAllClientsInRoom(lobby, "Next question")
}
