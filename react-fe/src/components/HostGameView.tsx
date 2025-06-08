import { Box, Button, Typography } from "@mui/material";

import Leaderboard from "./Leaderboard";
import { RootState } from "../stores/store";
import { executeWebSocketCommand } from "../util/websocketUtil";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function HostGameView() {
  const game = useSelector((state: RootState) => state.game);
  const [currentView, setCurrentView] = useState<'question' | 'leaderboard'>('question');


  const handleViewLeaderboard = () => {
    console.log("Viewing the leaderboard")
    setCurrentView('leaderboard')
  }

  const handleNextQuestion = () => {
    console.log("Moving onto the next question")
    executeWebSocketCommand(
      "nextQuestion",
      { roomCode: game.roomCode, user: game.user},
      (errorMessage) => console.log(errorMessage)
    );
    setCurrentView('question')
  }

  return (
    <>
      <Typography variant="body1">
        You are the host and the game has started
      </Typography>

      {currentView === 'question' ? (
        <>
          <Typography variant="h5" gutterBottom>
            Quiz: {game.currentQuestion?.question}
          </Typography>
          <Box>
            {Array.isArray(game.currentQuestion?.options) && 
              game.currentQuestion?.options.map((option, index) => (
                <Typography key={index} variant="body1">
                  {index + 1}. {option}
                </Typography>
              ))
            }
          </Box>
          <Button onClick={handleViewLeaderboard}>
            View Leaderboard
          </Button>
        </>
      ) : currentView === 'leaderboard' ? (
        <>
          <Leaderboard />
          <Button onClick={handleNextQuestion}>
            Next Question
          </Button>
        </>
      ) : ( <Typography variant="h5" gutterBottom> Unknown View </Typography> ) // TODO: might remove because not really needed
      } 
    </>
  );
}