package main

import "go.mongodb.org/mongo-driver/v2/bson"

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
