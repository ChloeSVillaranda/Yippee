import { Box, Button, Typography } from "@mui/material";

import { RootState } from "../stores/store";
import { useSelector } from "react-redux";

export default function PlayerGameView() {
  const game = useSelector((state: RootState) => state.game);

  // send to backend player answer
  const handleSubmitAnswer = (index: number) => {
    
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
            <Button key={index}>
              {option}
            </Button>
          ))
        }
      </Box>
    </>
  );
}