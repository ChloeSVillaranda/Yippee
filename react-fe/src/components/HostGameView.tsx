import { Box, Typography } from "@mui/material";

import { RootState } from "../stores/store";
import { useSelector } from "react-redux";

export default function HostGameView() {
  const game = useSelector((state: RootState) => state.game);

  return (
    <>
      <Typography variant="body1">
        You are the host and the game has started
      </Typography>
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
    </>
  );
}