import { Box, Button, useTheme } from "@mui/material";

import styles from './Home.module.css';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  // Create dynamic styles based on theme
  const buttonStyle = {
    background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`,
    color: 'white',
    transition: 'transform 0.2s',
    width: '200px',
    padding: '10px 20px',
    '&:hover': {
      transform: 'scale(1.05)',
      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    }
  };

  return (
    <Box className={styles.buttonContainer}>
      <Button sx={buttonStyle} variant="contained" onClick={() => {navigate(`/host`)}}>
        Host Game
      </Button>
      <Button sx={buttonStyle} variant="contained" onClick={() => {navigate(`/join`)}}>
        Join Game
      </Button>
      <Button sx={buttonStyle} variant="contained" onClick={() => {navigate(`/create-quiz`)}}>
        Create Quiz
      </Button>
      <Button sx={buttonStyle} variant="contained" onClick={() => {navigate(`/resources`)}}>
        Resources
      </Button>
    </Box>
  );
}