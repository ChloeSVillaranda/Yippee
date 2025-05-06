import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

type Question = {
  question: string;
  points: number;
  difficulty: string;
  hint: string;
  category: string;
  options: string[];
  answerIndex: number;
};

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", points: 0, difficulty: "", hint: "", category: "", options: ["", "", "", ""], answerIndex: 0 },
  ]);

  const handleQuestionChange = <K extends keyof Question>(index: number, field: K, value: Question[K]) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", points: 0, difficulty: "", hint: "", category: "", options: ["", "", "", ""], answerIndex: 0 },
    ]);
  };

  const handleSubmit = async () => {
    const payload = {
      quizName,
      quizDescription,
      user: "Test_User", // Replace with actual user data
      questions,
    };

    try {
      const response = await fetch("http://localhost:8080/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Quiz created successfully!");
      } else {
        alert("Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create a Quiz
      </Typography>
      <TextField
        label="Quiz Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={quizName}
        onChange={(e) => setQuizName(e.target.value)}
      />
      <TextField
        label="Quiz Description"
        variant="outlined"
        fullWidth
        margin="normal"
        value={quizDescription}
        onChange={(e) => setQuizDescription(e.target.value)}
      />
      {questions.map((q, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Question {index + 1}</Typography>
          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.question}
            onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
          />
          <TextField
            label="Points"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.points}
            onChange={(e) => handleQuestionChange(index, "points", parseInt(e.target.value))}
          />
          <TextField
            label="Difficulty"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.difficulty}
            onChange={(e) => handleQuestionChange(index, "difficulty", e.target.value)}
          />
          <TextField
            label="Hint"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.hint}
            onChange={(e) => handleQuestionChange(index, "hint", e.target.value)}
          />
          <TextField
            label="Category"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.category}
            onChange={(e) => handleQuestionChange(index, "category", e.target.value)}
          />
          {q.options.map((option, optIndex) => (
            <TextField
              key={optIndex}
              label={`Option ${optIndex + 1}`}
              variant="outlined"
              fullWidth
              margin="normal"
              value={option}
              onChange={(e) => {
                const updatedOptions = [...q.options];
                updatedOptions[optIndex] = e.target.value;
                handleQuestionChange(index, "options", updatedOptions);
              }}
            />
          ))}
          <TextField
            label="Answer Index"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.answerIndex}
            onChange={(e) => handleQuestionChange(index, "answerIndex", parseInt(e.target.value))}
          />
        </Box>
      ))}
      <Button variant="contained" onClick={addQuestion} sx={{ marginBottom: 2 }}>
        Add Question
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Quiz
      </Button>
    </Box>
  );
}