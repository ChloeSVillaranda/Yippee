package main

import (
	"context"
	"log"
)

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

	collection := client.Database("test_db").Collection("test_collection")

	// Perform CRUD operations
	// createDocument(collection, bson.D{{"name", "Test A"}})
	readDocuments(collection)
	// updateDocument(bson.D{{"name", "Test A"}}, bson.D{{"$set", bson.D{{"name", "Test B"}}}})
	// deleteDocument(bson.D{{"name", "Test B"}})
}
