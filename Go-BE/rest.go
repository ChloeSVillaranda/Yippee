// This file defines all of the REST endpoints called to create and retrieve quizzes from the FE
package main

import (
	"encoding/json"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Struct to parse data
type Quiz struct {
	QuizName        string          `json:"quizName"`
	QuizDescription string          `json:"quizDescription"`
	CreatedBy       string          `json:"user"`
	QuizQuestions   []QuizQuestions `json:"questions"`
}

type QuizQuestions struct {
	Question   string   `json:"question"`
	Points     int      `json:"points"`
	Difficulty int      `json:"difficulty"`
	Hint       string   `json:"hint"`
	Category   []string `json:"category"`
	Options    []string `json:"options"`
	Answer     int      `json:"answer"`
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

	// Convert QuizQuestions to []bson.D
	var quizQuestions []bson.D
	for _, question := range quiz.QuizQuestions {
		quizQuestions = append(quizQuestions, bson.D{
			{Key: "question", Value: question.Question},
			{Key: "points", Value: question.Points},
			{Key: "difficulty", Value: question.Difficulty},
			{Key: "hint", Value: question.Hint},
			{Key: "category", Value: question.Category},
			{Key: "options", Value: question.Options},
			{Key: "answer", Value: question.Answer},
		})
	}

	// Call the createQuiz function
	createQuiz(quiz.QuizName, quiz.QuizDescription, quiz.CreatedBy, quizQuestions)

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Quiz created successfully"))
}

// REST endpoint to get all quizzes
func getQuizzesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// query the database to retrieve all quizzes
	cursor, err := Quiz_Collection.Find(r.Context(), bson.D{})
	if err != nil {
		http.Error(w, "Failed to retrieve quizzes", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(r.Context())

	// parse the results into a slice of quizzes
	var quizzes []Quiz
	for cursor.Next(r.Context()) {
		var quiz bson.M
		if err := cursor.Decode(&quiz); err != nil {
			http.Error(w, "Failed to parse quiz", http.StatusInternalServerError)
			return
		}

		// map the BSON data to the Quiz struct
		var parsedQuiz Quiz
		if quizName, ok := quiz["quizName"].(string); ok {
			parsedQuiz.QuizName = quizName
		}
		if quizDescription, ok := quiz["quizDescription"].(string); ok {
			parsedQuiz.QuizDescription = quizDescription
		}
		if user, ok := quiz["createdBy"].(string); ok {
			parsedQuiz.CreatedBy = user
		}

		// map the quizQuestions field
		if quizQuestions, ok := quiz["quizQuestions"].([]interface{}); ok {
			for _, q := range quizQuestions {
				if qMap, ok := q.(map[string]interface{}); ok {
					question := QuizQuestions{}

					// Safely map nested fields
					if questionText, ok := qMap["question"].(string); ok {
						question.Question = questionText
					}
					if points, ok := qMap["points"].(float64); ok {
						question.Points = int(points)
					}
					if difficulty, ok := qMap["difficulty"].(float64); ok {
						question.Difficulty = int(difficulty)
					}
					if hint, ok := qMap["hint"].(string); ok {
						question.Hint = hint
					}
					if category, ok := qMap["category"].([]interface{}); ok {
						question.Category = toStringSlice(category)
					}
					if options, ok := qMap["options"].([]interface{}); ok {
						question.Options = toStringSlice(options)
					}
					if answer, ok := qMap["answer"].(float64); ok {
						question.Answer = int(answer)
					} else if answerInt, ok := qMap["answer"].(int); ok {
						question.Answer = answerInt
					}

					parsedQuiz.QuizQuestions = append(parsedQuiz.QuizQuestions, question)
				}
			}
		}

		quizzes = append(quizzes, parsedQuiz)
	}

	// Check for cursor errors
	if err := cursor.Err(); err != nil {
		http.Error(w, "Error iterating through quizzes", http.StatusInternalServerError)
		return
	}

	// Return the quizzes as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quizzes)
}

// Helper function to convert []interface{} to []string
func toStringSlice(input []interface{}) []string {
	var output []string
	for _, v := range input {
		if str, ok := v.(string); ok {
			output = append(output, str)
		}
	}
	return output
}

// DELETE quiz (placeholder for future implementation)
