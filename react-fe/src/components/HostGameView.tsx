import { Button, Typography } from "@mui/material";

import Leaderboard from "./Leaderboard";
import { QuestionView } from "./QuestionView";
import { RootState } from "../stores/store";
import { executeWebSocketCommand } from "../util/websocketUtil";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function HostGameView() {
  const game = useSelector((state: RootState) => state.game);
  const [leaderboardView, setLeaderboardView] = useState<'page1' | 'page2'>('page1');
  
  const handleViewLeaderboard = () => {
    console.log("Viewing the leaderboard")
    executeWebSocketCommand(
      "showLeaderboard",
      { roomCode: game.roomCode, user: game.user},
      (errorMessage) => console.log(errorMessage)
    );
    setLeaderboardView('page1')
  }

  const handleViewLeaderboard2 = () => {
    setLeaderboardView('page2')
  }

  const handleNextQuestion = () => {
    console.log("Moving onto the next question")
    executeWebSocketCommand(
      "nextQuestion",
      { roomCode: game.roomCode, user: game.user},
      (errorMessage) => console.log(errorMessage)
    );
  }

  return (
    <>
      <Typography variant="body1">
        You are the host and the game has started
      </Typography>

      {!game.showLeaderboard ? (
        // show question
        <>
          <QuestionView displayCorrectAnswers={false} />
          <Button onClick={handleViewLeaderboard}>
            Next
          </Button>
        </>
      ) : (
        // show leaderboard
        <> 
          {leaderboardView === 'page1' ? (
            <>
              <QuestionView displayCorrectAnswers={true} />
              <Button onClick={handleViewLeaderboard2}>
                View Final Results
              </Button>
            </>
          ) : (
            <>
              <Leaderboard />
              <Button onClick={handleNextQuestion}>
                Next Question
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
}