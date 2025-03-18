package main

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

var Quiz_Collection *mongo.Collection

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

	createQuiz()
	// Perform CRUD operations

	// createDocument(Quiz_Collection, bson.D{{"name", "Test C"}})
	// readDocuments(collection)
	// updateDocument(bson.D{{"name", "Test A"}}, bson.D{{"$set", bson.D{{"name", "Test B"}}}})
	// deleteDocument(bson.D{{"name", "Test B"}})
}
