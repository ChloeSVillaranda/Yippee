// This file defines all of the REST endpoints called to create and retrieve quizzes from the FE
package main

import (
	"encoding/json"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// // REST endpoint to create a quiz
// func createQuizHandler(w http.ResponseWriter, r *http.Request) {
// 	if r.Method != http.MethodPost {
// 		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
// 		return
// 	}

// 	var quiz Quiz
// 	err := json.NewDecoder(r.Body).Decode(&quiz)
// 	if err != nil {
// 		http.Error(w, "Invalid request body", http.StatusBadRequest)
// 		return
// 	}

// 	// Convert QuizQuestions to []bson.D
// 	var quizQuestions []bson.D
// 	for _, question := range quiz.QuizQuestions {
// 		quizQuestions = append(quizQuestions, bson.D{
// 			{Key: "question", Value: question.Question},
// 			{Key: "points", Value: question.Points},
// 			{Key: "difficulty", Value: question.Difficulty},
// 			{Key: "hint", Value: question.Hint},
// 			{Key: "category", Value: question.Category},
// 			{Key: "options", Value: question.Options},
// 			{Key: "answer", Value: question.Answer},
// 		})
// 	}

// 	// Call the createQuiz function
// 	createQuiz(quiz.QuizName, quiz.QuizDescription, quiz.CreatedBy, quizQuestions)

// 	w.WriteHeader(http.StatusCreated)
// 	w.Write([]byte("Quiz created successfully"))
// }

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

		if val, ok := qMap["options"].(bson.A); ok {
			q.Options = toStringSlice(val)
		}

		if val, ok := qMap["answer"]; ok {
			switch v := val.(type) {
			case int32:
				q.Answer = int(v)
			case int64:
				q.Answer = int(v)
			case int:
				q.Answer = v
			}
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
