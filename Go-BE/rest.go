// This file is defines all of the REST endpoints called to create a quiz from the FE
package main

import (
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// struct to parse incoming quiz data
type Quiz struct {
	QuizName        string   `json:"quizName"`
	QuizDescription string   `json:"quizDescription"`
	User            string   `json:"user"`
	Questions       []bson.D `json:"questions"`
}

// REST endpoint to create a quiz
func createQuizHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var quiz Quiz
	err := json.NewDecoder(r.Body).Decode(&quiz)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// call the createQuiz function
	createQuiz(quiz.QuizName, quiz.QuizDescription, quiz.User, quiz.Questions)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Quiz created successfully"))
}
