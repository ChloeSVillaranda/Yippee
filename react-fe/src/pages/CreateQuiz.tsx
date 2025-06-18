import { Box, Button, Checkbox, Chip, FormControlLabel, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Quiz, QuizQuestion } from "../stores/types";

import DeleteIcon from '@mui/icons-material/Delete';
import styles from './CreateQuiz.module.css';
import { useState } from "react";

type QuizQuestionForm = {
  question: string;
  points: number;
  difficulty: number;
  hint: string;
  type: string;
  category: string[];
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
};

// type QuizForm = {
//   quizName: string;
//   quizDescription: string;
//   createdBy: string;
//   quizQuestions: QuizQuestionForm[];
// };

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([{
    question: "",
    points: 0,
    difficulty: 1,
    hint: "",
    type: "multiple",
    category: [],
    options: Array(2).fill({ text: "", isCorrect: false }),
  }]);

  const handleQuestionChange = <K extends keyof QuizQuestionForm>(
    index: number,
    field: K,
    value: QuizQuestionForm[K]
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const updatedQuestions = [...questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: value
    };
    updatedQuestions[questionIndex].options = updatedOptions;
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
        options: Array(2).fill({ text: "", isCorrect: false }),
      },
    ]);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({ text: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const deleteQuestion = (indexToDelete: number) => {
    if (questions.length <= 1) {
      alert("Cannot delete the last question");
      return;
    }
    const updatedQuestions = questions.filter((_, index) => index !== indexToDelete);
    setQuestions(updatedQuestions);
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    if (questions[questionIndex].options.length <= 2) {
      alert("Must have at least 2 options");
      return;
    }
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, index) => index !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const transformQuestionForSubmission = (question: QuizQuestionForm): QuizQuestion => {
      return {
        question: question.question,
        points: question.points,
        difficulty: question.difficulty,
        hint: question.hint,
        type: question.type,
        category: question.category,
        correctAnswers: question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text),
        incorrectAnswers: question.options
          .filter(opt => !opt.isCorrect)
          .map(opt => opt.text),
      } as QuizQuestion;
  };

  const handleSubmit = async () => {
    const transformedQuestions = questions.map(transformQuestionForSubmission);
    
    const quiz: Quiz = {
      quizName,
      quizDescription,
      createdBy: "Test_User",
      quizQuestions: transformedQuestions,
    };

    console.log('Submitting quiz:', JSON.stringify(quiz, null, 2));

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
    <div className={styles.container}>
      <div className={styles.innerBox}>
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
          {questions.map((q, questionIndex) => (
            <Box key={questionIndex} sx={{ marginBottom: 4, padding: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Question {questionIndex + 1}</Typography>
                <IconButton onClick={() => deleteQuestion(questionIndex)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Typography variant="h6">Question {questionIndex + 1}</Typography>
              <TextField
                label="Question"
                variant="outlined"
                fullWidth
                margin="normal"
                value={q.question}
                onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
              />
              <TextField
                label="Points"
                type="number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={q.points}
                onChange={(e) => handleQuestionChange(questionIndex, "points", parseInt(e.target.value) || 0)}
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
                onChange={(e) => handleQuestionChange(questionIndex, "difficulty", parseInt(e.target.value) || 1)}
              />
              <TextField
                label="Hint"
                variant="outlined"
                fullWidth
                margin="normal"
                value={q.hint}
                onChange={(e) => handleQuestionChange(questionIndex, "hint", e.target.value)}
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
                        <Button onClick={() => handleCategoryAdd(questionIndex)}>Add</Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}>
                  {q.category.map((cat, catIndex) => (
                    <Chip
                      key={catIndex}
                      label={cat}
                      onDelete={() => handleCategoryDelete(questionIndex, catIndex)}
                    />
                  ))}
                </Box>
              </Box>

              {/* Options */}
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Answer Options</Typography>
              {q.options.map((option, optionIndex) => (
                <Box key={optionIndex} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label={`Option ${optionIndex + 1}`}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={option.text}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                      />
                    }
                    label="Correct"
                  />
                  <IconButton 
                    size="small"
                    onClick={() => deleteOption(questionIndex, optionIndex)
                  }>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => addOption(questionIndex)}
                sx={{ mt: 1 }}
              >
                Add Option
              </Button>
            </Box>
          ))}
          <Button variant="contained" onClick={addQuestion} sx={{ marginRight: 2 }}>
            Add Question
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit Quiz
          </Button>
        </Box>
      </div>
    </div>
  );
}