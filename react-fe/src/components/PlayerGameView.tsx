import { Box, Button, Typography } from "@mui/material";

import { RootState } from "../stores/store";
import { executeWebSocketCommand } from "../util/websocketUtil";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function PlayerGameView() {
  const game = useSelector((state: RootState) => state.game);

  // send to backend player answer
  const handleSubmitAnswer = (index: number) => {
    
    
    console.log("Submitted answer:", index)

    executeWebSocketCommand(
      "submitAnswer",
      { roomCode: game.roomCode, user: game.user, answer: index},
      (errorMessage) => console.log(errorMessage)
    );
  }

  return (
    <>
      <Typography variant="body1">
        You are a player and the game has started
      </Typography>
      <Typography variant="h5" gutterBottom>
        Quiz: {game.currentQuestion?.question}
      </Typography>
      <Box>
        {Array.isArray(game.currentQuestion?.options) && 
          game.currentQuestion?.options.map((option, index) => (
            <Button key={index} onClick={() => handleSubmitAnswer(index)}>
              {option}
            </Button>
          ))
        }
      </Box>
    </>
  );
}