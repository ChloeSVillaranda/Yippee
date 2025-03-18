// contains all the functions a user is able to do (ex. create/update/delete quiz)
package main

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Lets user create a quiz in the database
func createQuiz() {
	fmt.Println("Creating a quiz")

	// Define quiz details
	quizDetails := bson.D{
		{Key: "quizName", Value: "Test_Quiz"},
		{Key: "quizDescription", Value: "This is a sample quiz description"},
		{Key: "dateCreated", Value: time.Now()},
		{Key: "quizQuestions", Value: bson.A{
			bson.D{
				{Key: "question", Value: "What is the capital of France?"},
				{Key: "points", Value: 20},
				{Key: "difficulty", Value: "Easy"},
				{Key: "hint", Value: "Starts with letter 'P'"},
				{Key: "category", Value: "Geography"},
				{Key: "options", Value: bson.A{"Paris", "London", "Berlin", "Madrid"}},
				{Key: "answer", Value: bson.A{1}},
			},
			bson.D{
				{Key: "question", Value: "2 + 2 = 22"},
				{Key: "points", Value: 10},
				{Key: "correctAnswer", Value: false},
			},
		}},
		{Key: "createdBy", Value: "Test_User"},
	}

	createDocument(Quiz_Collection, quizDetails)
}

// func hello {
// 	// nothing
// }
