import 'react-multi-carousel/lib/styles.css';

import { Box, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import Carousel from 'react-multi-carousel';
import WithStyles from '@mui/material/styles/withStyles';

const responsive = {
superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
},
desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
},
tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
},
mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
}
};

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

export default function SelectQuiz() {
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

    <Carousel responsive={responsive} draggable={false} infinite={true}>
        <div>
        <img
            src="https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
            alt="Fixing CSS load order"
            style={{ width: "100%", borderRadius: "8px" }}
            />
        </div>
        <div>
        <img
            src="https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
            alt="Fixing CSS load order"
            style={{ width: "100%", borderRadius: "8px" }}
            />
        </div>
        <div>
        <img
            src="https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
            alt="Fixing CSS load order"
            style={{ width: "100%", borderRadius: "8px" }}
            />
        </div>
        <div>
        <img
            src="https://images.unsplash.com/photo-1549989476-69a92fa57c36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
            alt="Fixing CSS load order"
            style={{ width: "100%", borderRadius: "8px" }}
            />
        </div>

    </Carousel>
    </Box>

  );
}