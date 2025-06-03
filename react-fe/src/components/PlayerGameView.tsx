import { Box, Button, Typography } from "@mui/material";

import { RootState } from "../stores/store";
import { executeWebSocketCommand } from "../util/websocketUtil";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function PlayerGameView() {
  const game = useSelector((state: RootState) => state.game);
  const [submittedAnswer, setSubmittedAnswer] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  const handleAnswerSelect = (option: string) => {
    setSelectedAnswers(prev => {
      return prev.includes(option) 
        ? prev.filter(answer => answer !== option)
        : [...prev, option];
    });
  };

  const handleSubmitAnswers = () => {
    console.log("Submitted answers:", selectedAnswers);
    setSubmittedAnswer(true);

    executeWebSocketCommand(
      "submitAnswer",
      { 
        roomCode: game.roomCode, 
        user: game.user, 
        answer: selectedAnswers
      },
      (errorMessage) => console.log(errorMessage)
    );
  };

  return (
    <>
      <Typography variant="body1">
        You are a player and the game has started
      </Typography>
      <Typography variant="h5" gutterBottom>
        Quiz: {game.currentQuestion?.question}
      </Typography>
      {submittedAnswer ? (
        <Typography variant="h5" gutterBottom>
          Answer Submitted
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            {Array.isArray(game.currentQuestion?.options) &&
              game.currentQuestion?.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  variant={selectedAnswers.includes(option) ? "contained" : "outlined"}
                  sx={{ m: 1 }}
                >
                  {option}
                </Button>
              ))}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAnswers}
            disabled={selectedAnswers.length === 0}
          >
            Submit Answers
          </Button>
        </Box>
      )}
    </>
  );
}