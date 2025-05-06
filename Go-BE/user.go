// contains all the functions a user is able to do (ex. create/update/delete quiz)
package main

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Helper function to create a quiz questions (multiple choice + true/false)
func createQuestion(question string, points int, difficulty string, hint string, category string, options []string, answerIndex int) bson.D {
	// Convert []string of options to bson.A
	bsonOptions := bson.A{}
	for _, option := range options {
		bsonOptions = append(bsonOptions, option)
	}

	return bson.D{
		{Key: "question", Value: question},
		{Key: "points", Value: points},
		{Key: "difficulty", Value: difficulty},
		{Key: "hint", Value: hint},
		{Key: "category", Value: category},
		{Key: "options", Value: bsonOptions},
		{Key: "answer", Value: answerIndex},
	}
}

func createQuiz(quizName string, quizDescription string, user string, quizQuestions []bson.D) {
	fmt.Println("Creating a quiz")

	// define quiz details
	quizDetails := bson.D{
		{Key: "quizName", Value: quizName},
		{Key: "quizDescription", Value: quizDescription},
		{Key: "dateCreated", Value: time.Now()},
		{Key: "quizQuestions", Value: quizQuestions},
		{Key: "createdBy", Value: user},
	}

	// save the quiz to the database
	createDocument(Quiz_Collection, quizDetails)
}
