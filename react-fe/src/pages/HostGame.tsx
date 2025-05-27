import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, setupWebSocketHandlers, useCheckConnection } from "../util/websocketUtil";
import { useDispatch, useSelector } from "react-redux";

import { Quiz } from "../stores/types";
import { RootState } from "../stores/store";
import SelectQuiz from "../components/SelectQuiz";
import { disconnect } from "../stores/websocketSlice";
import { gameActions } from "../stores/gameSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// import { setQuiz, setRole, setUserName, upsertClientsInLobby } from "../stores/gameSlice";










export default function HostGame() {
  const [hostName, setHostName] = useState<string>(""); // host name input
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const host = useSelector((state: RootState) => state.game.user); // get host details from Redux

  useCheckConnection();

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

    executeWebSocketCommand(
      "createLobby",
      { quiz: selectedQuiz, user: user },
      (errorMessage) => setError(errorMessage)
    );

    setupWebSocketHandlers(
      (data) => {
        console.log("Message from server from Host Game:", data);

        if (data.roomCode) {
          dispatch(gameActions.setQuiz(selectedQuiz));
          dispatch(gameActions.upsertClientsInLobby([user]));
          navigate(`/${data.roomCode}`);
        } else {
          setError("Room code not received from server.");
          console.error("Room code not received from server:", data);
        }
      },
      () => {
        dispatch(disconnect());
      },
      (error) => {
        setError("An error occurred with the WebSocket connection.");
        dispatch(disconnect());
      }
    );
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
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
        <Typography variant="h6" gutterBottom>
          Selected Quiz: {selectedQuiz.quizName}
        </Typography>
      )}
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleHostGame}
        sx={{ marginTop: 2 }}
      >
        Host Game
      </Button>
    </Box>
  );
}