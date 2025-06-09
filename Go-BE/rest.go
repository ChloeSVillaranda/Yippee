// This file defines all of the REST endpoints called to create and retrieve quizzes from the FE
package main

import (
	"encoding/json"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// REST endpoint to create a quiz
func createQuizHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Decode the request body into a Quiz struct
	var quiz Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if quiz.QuizName == "" || quiz.CreatedBy == "" || len(quiz.QuizQuestions) == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Create BSON document for MongoDB
	doc := bson.D{
		{Key: "quizName", Value: quiz.QuizName},
		{Key: "quizDescription", Value: quiz.QuizDescription},
		{Key: "createdBy", Value: quiz.CreatedBy},
		{Key: "quizQuestions", Value: quiz.QuizQuestions},
	}

	// Insert into MongoDB
	result, err := Quiz_Collection.InsertOne(r.Context(), doc)
	if err != nil {
		log.Printf("Error creating quiz: %v", err)
		http.Error(w, "Failed to create quiz", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Quiz created successfully",
		"id":      result.InsertedID,
	})
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
		log.Printf("Raw quiz document: %+v", quiz)
		if err := cursor.Decode(&quiz); err != nil {
			http.Error(w, "Failed to parse quiz", http.StatusInternalServerError)
			return
		}

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

		log.Println("attempting to look through the quiz questions")

		// parse quizQuestions
		if questions, ok := quiz["quizQuestions"]; ok {
			parsedQuiz.QuizQuestions = parseQuizQuestions(questions)
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

// TODO: place in helper function file
func parseQuizQuestions(questionsToParse interface{}) []QuizQuestion {
	var questionsParsed []QuizQuestion

	// try to convert to bson.a
	questions, ok := questionsToParse.(bson.A)
	if !ok {
		log.Printf("Warning: quizQuestions type: %T", questionsToParse)
		return questionsParsed
	}

	for _, question := range questions {
		var qMap bson.M
		switch v := question.(type) {
		case bson.M:
			qMap = v
		case bson.D:
			qMap = make(bson.M)
			for _, elem := range v {
				qMap[elem.Key] = elem.Value
			}
		default:
			log.Printf("Warning: question type %T cannot be converted to bson.M", question)
			continue
		}

		var q QuizQuestion

		if val, ok := qMap["question"]; ok {
			if str, ok := val.(string); ok {
				q.Question = str
			}
		}

		if val, ok := qMap["points"]; ok {
			switch v := val.(type) {
			case int32:
				q.Points = int(v)
			case int64:
				q.Points = int(v)
			case int:
				q.Points = v
			}
		}

		if val, ok := qMap["difficulty"]; ok {
			switch v := val.(type) {
			case int32:
				q.Difficulty = int(v)
			case int64:
				q.Difficulty = int(v)
			case int:
				q.Difficulty = v
			}
		}

		if val, ok := qMap["hint"].(string); ok {
			q.Hint = val
		}

		if val, ok := qMap["category"].(bson.A); ok {
			q.Category = toStringSlice(val)
		}

		if val, ok := qMap["incorrectAnswers"].(bson.A); ok {
			q.IncorrectAnswers = toStringSlice(val)
		}

		if val, ok := qMap["correctAnswers"].(bson.A); ok {
			q.CorrectAnswers = toStringSlice(val)
		}

		questionsParsed = append(questionsParsed, q)
	}

	return questionsParsed
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
