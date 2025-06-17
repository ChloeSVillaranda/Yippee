import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, useCheckConnection } from "../util/websocketUtil";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { Quiz } from "../stores/types";
import { RootState } from "../stores/store";
import SelectQuiz from "../components/SelectQuiz";
import { gameActions } from "../stores/gameSlice";
import styles from './HostGame.module.css';
import { useNavigate } from "react-router-dom";

export default function HostGame() {
  const [hostName, setHostName] = useState<string>(""); // host name input
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // get necessary states from Redux
  const roomCode = useSelector((state: RootState) => state.game.roomCode);
  const gameStatus = useSelector((state: RootState) => state.game.gameStatus);

  useCheckConnection();

  useEffect(() => {
    if (roomCode && gameStatus === "Waiting") {
      navigate(`/${roomCode}`);
    }
  }, [roomCode, gameStatus, navigate]);

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
  };

  const handleHostGame = async () => {
    // input host name
    if (!hostName.trim()) {
      setError("Host name cannot be empty!");
      return;
    }

    // select quiz
    if (!selectedQuiz) {
      setError("Please select a quiz first!");
      return;
    }

    // update redux state
    dispatch(gameActions.setUserName(hostName));
    dispatch(gameActions.setRole("host"));

    // TODO: figure out how to use the updated state instead of creating an object to pass 
    const user = {
      userName: hostName,
      userRole: "host",
      userMessage: "",
      points: 0,
    };

    console.log("sending the request of createLobby with: ", selectedQuiz, user)

    executeWebSocketCommand(
      "createLobby",
      { quiz: selectedQuiz, user: user },
      (errorMessage) => setError(errorMessage)
    );
  };

  return (
  <div className={styles.container}>
      <div className={styles.formBox}> 
        <Typography variant="h4" gutterBottom className={styles.title}>
            Host a Game
          </Typography>
          <TextField
            id="host-name"
            label="Enter Your Name"
            variant="outlined"
            fullWidth
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <SelectQuiz onSelectQuiz={handleSelectQuiz} />
          {selectedQuiz && (
            <Typography variant="h6" gutterBottom className={styles.selectQuizTitle}>
              Selected Quiz: {selectedQuiz.quizName}
            </Typography>
          )}
          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          <div className={styles.buttonDiv}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleHostGame}
              className={styles.button}
            >
              Host Game
            </Button>
          </div>
        </div>
      </div>
  );
}