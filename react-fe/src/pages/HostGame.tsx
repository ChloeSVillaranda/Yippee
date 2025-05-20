import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, setupWebSocketHandlers, useCheckConnection } from "../util/websocketUtil";

import SelectQuiz from "../components/SelectQuiz";
import { disconnect } from "../stores/websocketSlice";
import { setRole } from "../stores/gameSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HostGame() {
  const [hostName, setHostName] = useState<string>(""); // Host name input
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useCheckConnection();

  const handleSelectQuiz = (quizName: string) => {
    setSelectedQuiz(quizName);
  };

  const handleHostGame = () => {
    // Validate host name
    if (!hostName.trim()) {
      setError("Host name cannot be empty!");
      return;
    }

    // Validate selected quiz
    if (!selectedQuiz) {
      setError("Please select a quiz first!");
      return;
    }

    // Execute the "createLobby" WebSocket command
    executeWebSocketCommand(
      "createLobby",
      { quizName: selectedQuiz, hostName: hostName },
      (errorMessage) => setError(errorMessage) // Error callback
    );

    // Set up WebSocket event handlers
    setupWebSocketHandlers(
      (data) => {
        console.log("Message from server from Host Game:", data);

        if (data.roomCode) {
          setRoomCode(data.roomCode);
          dispatch(setRole("host")); // set role as host in Redux
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
          Selected Quiz: {selectedQuiz}
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
      {roomCode && (
        <Typography variant="h5" sx={{ marginTop: 2 }}>
          Room Code: {roomCode}
        </Typography>
      )}
    </Box>
  );
}