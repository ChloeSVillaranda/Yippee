package main

import (
	"context"
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/gorilla/mux"
)

var Quiz_Collection *mongo.Collection

func populateDbWithQuizzes() {
	quizQuestionsForQuiz1 := []bson.M{
		createQuestion(
			"What is the capital of France?",
			20,
			2,
			"Starts with letter 'P'",
			[]string{"Geography"},
			[]string{"London", "Berlin", "Madrid"},
			[]string{"Paris"},
			"multiple_choice",
		),
		createQuestion(
			"2 + 2 = 22",
			10,
			2,
			"",
			[]string{"Math"},
			[]string{"True"},
			[]string{"False"},
			"true_false",
		),
	}

	createQuiz("Quiz1", "test to see if this will work", "test_user", quizQuestionsForQuiz1)

	quizQuestionsForQuiz2 := []bson.M{
		createQuestion(
			"What is the capital of Spain?",
			20,
			2,
			"Starts with letter 'M'",
			[]string{"Geography"},
			[]string{"Paris", "London", "Berlin"},
			[]string{"Madrid"},
			"multiple_choice",
		),
		createQuestion(
			"2 + 2 = 4",
			10,
			2,
			"",
			[]string{"Math"},
			[]string{"False"},
			[]string{"True"},
			"true_false",
		),
	}

	createQuiz("Quiz2", "test to see if this will work", "test_user2", quizQuestionsForQuiz2)
}

// enable cors
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// handle preflight (OPTIONS) requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

func main() {
	// connect to the database
	// TODO: can extract into util function
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

	// Initialize the router
	r := mux.NewRouter()

	// WebSocket endpoint
	r.HandleFunc("/ws", handleWebSocket)

	// REST API endpoints
	// r.HandleFunc("/api/create-quiz", createQuizHandler).Methods("POST")
	r.HandleFunc("/api/get-quizzes", getQuizzesHandler).Methods("GET")

	// Enable CORS middleware
	handler := enableCORS(r)

	// Start the HTTP server
	port := "8080"
	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

}
