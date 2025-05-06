package main

import (
	"context"
	"log"
	"net/http"

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

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight (OPTIONS) requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
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

	// Create a new ServeMux
	mux := http.NewServeMux()
	mux.HandleFunc("/api/create-quiz", createQuizHandler)

	// Wrap the ServeMux with the CORS middleware
	handler := enableCORS(mux)

	// Start the HTTP server
	port := "8080"
	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// func main() {
// 	client, err := connectToDatabase()
// 	if err != nil {
// 		log.Fatalf("Failed to connect to MongoDB: %v", err)
// 	}
// 	defer func() {
// 		if err := client.Disconnect(context.TODO()); err != nil {
// 			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
// 		}
// 	}()

// 	Quiz_Collection = client.Database("yippee_db").Collection("quizzes")

// 	// populateDbWithQuizzes()

// 	// register the routes that will be used for REST API calls
// 	http.HandleFunc("/api/create-quiz", createQuizHandler)

// 	// start the HTTP server
// 	port := "8080"
// 	log.Printf("Starting server on port %s...", port)
// 	if err := http.ListenAndServe(":"+port, nil); err != nil {
// 		log.Fatalf("Failed to start server: %v", err)
// 	}

// 	// CRUD operations examples here
// 	// createDocument(Quiz_Collection, bson.D{{"name", "Test C"}})
// 	// readDocuments(collection)
// 	// updateDocument(bson.D{{"name", "Test A"}}, bson.D{{"$set", bson.D{{"name", "Test B"}}}})
// 	// deleteDocument(bson.D{{"name", "Test B"}})
// }
