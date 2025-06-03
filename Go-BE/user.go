// contains all the functions a user is able to do to mongodb (ex. create/update/delete quiz)
package main

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// helper function to create a quiz questions (multiple choice + true/false)
func createQuestion(question string, points int, difficulty int, hint string, category []string, incorrectAnswers []string, correctAnswers []string, typeOfQuestion string) bson.M {
	return bson.M{
		"question":         question,
		"points":           points,
		"difficulty":       difficulty,
		"hint":             hint,
		"category":         category,
		"incorrectAnswers": incorrectAnswers,
		"correctAnswers":   correctAnswers,
		"type":             typeOfQuestion,
	}
}

func createQuiz(quizName string, quizDescription string, user string, quizQuestions []bson.M) {
	fmt.Println("Creating a quiz")

	// define quiz details
	quizDetails := bson.M{
		"quizName":        quizName,
		"quizDescription": quizDescription,
		"dateCreated":     time.Now(),
		"quizQuestions":   quizQuestions,
		"createdBy":       user,
	}

	// save the quiz to the database
	createDocument(Quiz_Collection, quizDetails)
}
