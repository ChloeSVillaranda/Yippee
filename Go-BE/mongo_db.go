// Functions for CRUD operations
package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Connect to a MongoDB server and returns a client instance.
func connectToDatabase() (*mongo.Client, error) {
	uri := "mongodb://localhost:27017" // change uri to change server here
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, err
	}

	// Verify connection using Ping (requires context)
	ctx := context.TODO()
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	log.Println("Connected to MongoDB successfully")
	return client, nil
}

// Insert a single document into a collection.
func createDocument(collection *mongo.Collection, doc bson.M) {
	insertResult, err := collection.InsertOne(context.TODO(), doc)
	if err != nil {
		log.Fatalf("Failed to insert document: %v", err)
	}
	fmt.Println("Inserted a single document: ", insertResult.InsertedID)
}

// Read all documents of a collection
func readDocuments(collection *mongo.Collection) {
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		log.Fatalf("Failed to find documents: %v", err)
	}
	defer cursor.Close(context.TODO())

	fmt.Println("Documents in the collection:")
	for cursor.Next(context.TODO()) {
		var doc bson.M
		if err := cursor.Decode(&doc); err != nil {
			log.Fatalf("Failed to decode document: %v", err)
		}
		fmt.Println(doc)
	}
	if err := cursor.Err(); err != nil {
		log.Fatalf("Cursor error: %v", err)
	}
}

// Update a document in a collection
func updateDocument(collection *mongo.Collection, filter bson.D, update bson.D) {
	updateResult, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Fatalf("Failed to update document: %v", err)
	}
	fmt.Printf("Matched %v documents and updated %v documents.\n", updateResult.MatchedCount, updateResult.ModifiedCount)
}

// Delete a document from a collection
func deleteDocument(collection *mongo.Collection, filter bson.D) {
	deleteResult, err := collection.DeleteOne(context.TODO(), filter)
	if err != nil {
		log.Fatalf("Failed to delete document: %v", err)
	}
	fmt.Printf("Deleted %v documents.\n", deleteResult.DeletedCount)
}
