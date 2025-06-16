import { Box, Button, Chip, InputAdornment, TextField, Typography } from "@mui/material";

import { useState } from "react";

type QuizQuestion = {
  question: string;
  points: number;
  difficulty: number;
  hint: string;
  type: string;
  category: string[];
  incorrectAnswers: string[];
  correctAnswers: string[];
};

type Quiz = {
  quizName: string;
  quizDescription: string;
  createdBy: string;
  quizQuestions: QuizQuestion[];
};

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([{
    question: "",
    points: 0,
    difficulty: 1,
    hint: "",
    type: "multiple",
    category: [],
    incorrectAnswers: ["", "", ""],
    correctAnswers: [""],
  }]);

  // For handling category input
  const [currentCategory, setCurrentCategory] = useState("");

  const handleQuestionChange = <K extends keyof QuizQuestion>(
    index: number,
    field: K,
    value: QuizQuestion[K]
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleCategoryAdd = (index: number) => {
    if (currentCategory.trim()) {
      const updatedQuestions = [...questions];
      updatedQuestions[index].category = [...updatedQuestions[index].category, currentCategory.trim()];
      setQuestions(updatedQuestions);
      setCurrentCategory("");
    }
  };

  const handleCategoryDelete = (questionIndex: number, categoryIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].category.splice(categoryIndex, 1);
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        points: 0,
        difficulty: 1,
        hint: "",
        type: "multiple",
        category: [],
        incorrectAnswers: ["", "", ""],
        correctAnswers: [""],
      },
    ]);
  };

  const handleSubmit = async () => {
    const quiz: Quiz = {
      quizName,
      quizDescription,
      createdBy: "Test_User", // TODO: replace with actual user data
      quizQuestions: questions,
    };

    try {
      const response = await fetch("http://localhost:8080/api/create-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });

      if (response.ok) {
        alert("Quiz created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to create quiz: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to connect to server");
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
        multiline
        rows={2}
        value={quizDescription}
        onChange={(e) => setQuizDescription(e.target.value)}
      />
      {questions.map((q, index) => (
        <Box key={index} sx={{ marginBottom: 4, padding: 2, border: '1px solid #ddd', borderRadius: 2 }}>
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
            onChange={(e) => handleQuestionChange(index, "points", parseInt(e.target.value) || 0)}
          />
          <TextField
            label="Difficulty (1-5)"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              inputProps: { min: 1, max: 5 }
            }}
            value={q.difficulty}
            onChange={(e) => handleQuestionChange(index, "difficulty", parseInt(e.target.value) || 1)}
          />
          <TextField
            label="Hint"
            variant="outlined"
            fullWidth
            margin="normal"
            value={q.hint}
            onChange={(e) => handleQuestionChange(index, "hint", e.target.value)}
          />
          
          {/* Categories */}
          <Box sx={{ marginY: 2 }}>
            <TextField
              label="Add Category"
              variant="outlined"
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={() => handleCategoryAdd(index)}>Add</Button>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}>
              {q.category.map((cat, catIndex) => (
                <Chip
                  key={catIndex}
                  label={cat}
                  onDelete={() => handleCategoryDelete(index, catIndex)}
                />
              ))}
            </Box>
          </Box>

          {/* Correct Answers */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Correct Answer(s)</Typography>
          {q.correctAnswers.map((answer, ansIndex) => (
            <TextField
              key={ansIndex}
              label={`Correct Answer ${ansIndex + 1}`}
              variant="outlined"
              fullWidth
              margin="normal"
              value={answer}
              onChange={(e) => {
                const updatedAnswers = [...q.correctAnswers];
                updatedAnswers[ansIndex] = e.target.value;
                handleQuestionChange(index, "correctAnswers", updatedAnswers);
              }}
            />
          ))}

          {/* Incorrect Answers */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Incorrect Answers</Typography>
          {q.incorrectAnswers.map((answer, ansIndex) => (
            <TextField
              key={ansIndex}
              label={`Incorrect Answer ${ansIndex + 1}`}
              variant="outlined"
              fullWidth
              margin="normal"
              value={answer}
              onChange={(e) => {
                const updatedAnswers = [...q.incorrectAnswers];
                updatedAnswers[ansIndex] = e.target.value;
                handleQuestionChange(index, "incorrectAnswers", updatedAnswers);
              }}
            />
          ))}
        </Box>
      ))}
      <Button variant="contained" onClick={addQuestion} sx={{ marginRight: 2 }}>
        Add Question
      </Button>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit Quiz
      </Button>
    </Box>
  );
}