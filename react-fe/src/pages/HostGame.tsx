import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, setupWebSocketHandlers, useCheckConnection } from "../util/websocketUtil";
import { setRole, setUserName } from "../stores/gameSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../stores/store";
import SelectQuiz from "../components/SelectQuiz";
import { disconnect } from "../stores/websocketSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HostGame() {
  const [hostName, setHostName] = useState<string>(""); // host name input
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hostDetails = useSelector((state: RootState) => state.game.user); // get current host details from Redux

  useCheckConnection();

  const handleSelectQuiz = (quizName: string) => {
    setSelectedQuiz(quizName);
  };

  const handleHostGame = () => {
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

    // update redux
    dispatch(setUserName(hostName));
    dispatch(setRole("host"));

    // TODO: figure out how to use the updated state instead of creating an object to pass 
    const user = {
      userName: hostName,
      userRole: "host",
      userMessage: "",
      points: 0,
    };

    // send request to create a lobby
    executeWebSocketCommand(
      "createLobby",
      { quizName: selectedQuiz, user: user }, // TODO: pass state instead of the user
      (errorMessage) => setError(errorMessage) // Error callback
    );

    setupWebSocketHandlers(
      (data) => {
        console.log("Message from server from Host Game:", data);

        if (data.roomCode) {
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
    </Box>
  );
}