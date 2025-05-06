package main

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var Quiz_Collection *mongo.Collection

func populateDbWithQuizzes() {
	quizQuestionsForQuiz1 := []bson.D{
		createQuestion(
			"What is the capital of France?",
			20,
			"Easy",
			"Starts with letter 'P'",
			"Geography",
			[]string{"Paris", "London", "Berlin", "Madrid"},
			0,
		),
		createQuestion(
			"2 + 2 = 22",
			10,
			"Easy",
			"",
			"Math",
			[]string{"True", "False"},
			1,
		),
	}

	createQuiz("Quiz1", "test to see if this will work", "test_user", quizQuestionsForQuiz1)

	quizQuestionsForQuiz2 := []bson.D{
		createQuestion(
			"What is the capital of Spain?",
			20,
			"Easy",
			"Starts with letter 'P'",
			"Geography",
			[]string{"Paris", "London", "Berlin", "Madrid"},
			3,
		),
		createQuestion(
			"2 + 2 = 4",
			10,
			"Easy",
			"",
			"Math",
			[]string{"True", "False"},
			1,
		),
	}

	createQuiz("Quiz2", "test to see if this will work", "test_user2", quizQuestionsForQuiz2)

}

func main() {
	client, err := connectToDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()

	Quiz_Collection = client.Database("yippee_db").Collection("quizzes")

	populateDbWithQuizzes()
	// Perform CRUD operations

	// createDocument(Quiz_Collection, bson.D{{"name", "Test C"}})
	// readDocuments(collection)
	// updateDocument(bson.D{{"name", "Test A"}}, bson.D{{"$set", bson.D{{"name", "Test B"}}}})
	// deleteDocument(bson.D{{"name", "Test B"}})
}
