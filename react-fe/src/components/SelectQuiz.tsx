import 'react-multi-carousel/lib/styles.css';

import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import Carousel from 'react-multi-carousel';
import { Quiz } from '../stores/types';

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

type SelectQuizProps = {
  onSelectQuiz: (quiz: Quiz) => void;
};

export default function SelectQuiz({ onSelectQuiz }: SelectQuizProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch quizzes from the backend
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/get-quizzes");
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();
        console.log("received the response: ", data)
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
        Select a Quiz
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : quizzes.length > 0 ? (
        <Carousel responsive={responsive} draggable infinite>
          {quizzes.map((quiz, index) => (
            <Box
              key={index}
              sx={{
                padding: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                },
              }}
              onClick={() => onSelectQuiz(quiz)}
            > 
              <Typography variant="h6" gutterBottom>
                {quiz.quizName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {quiz.quizDescription}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Created by: {quiz.user}
              </Typography>
            </Box>
          ))}
        </Carousel>
      ) : (
        <Typography>No quizzes available.</Typography>
      )}
    </Box>
  );
}