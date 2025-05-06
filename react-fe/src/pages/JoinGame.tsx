import { Box, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

type Quiz = {
  quizName: string;
  quizDescription: string;
  user: string;
  questions: {
    question: string;
    points: number;
    difficulty: number;
    hint: string;
    category: string[];
    options: string[];
    answer: number;
  }[];
};

export default function JoinGame() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch quizzes from the backend
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/get-quizzes");
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Join a Game
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : quizzes.length > 0 ? (
        <List>
          {quizzes.map((quiz, index) => (
            <ListItem key={index} sx={{ borderBottom: "1px solid #ccc" }}>
              <ListItemText
                primary={quiz.quizName}
                secondary={`Description: ${quiz.quizDescription} | Created by: ${quiz.user}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No quizzes available.</Typography>
      )}
    </Box>
  );
}