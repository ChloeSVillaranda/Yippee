import { Box, Button, TextField, Typography } from "@mui/material";
import { connect, disconnect, setRole } from "../stores/websocketSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../stores/store";
import SelectQuiz from "../components/SelectQuiz";
import { getWebSocket } from "../stores/websocketSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HostGame() {
  const [hostName, setHostName] = useState<string>(""); // Host name input
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);

  const handleSelectQuiz = (quizName: string) => {
    setSelectedQuiz(quizName);
  };

  const handleHostGame = () => {
    if (!hostName.trim()) {
      setError("Host name cannot be empty!");
      return;
    }

    if (!selectedQuiz) {
      setError("Please select a quiz first!");
      return;
    }

    // Establish WebSocket connection if not already connected
    if (!isConnected) {
      dispatch(connect("ws://localhost:8080/ws"));
    }

    const webSocket = getWebSocket();
    if (webSocket) {
      if (webSocket.readyState === WebSocket.CONNECTING) {
        // Wait for the WebSocket connection to open
        webSocket.onopen = () => {
          console.log("WebSocket connection established.");
          sendCreateLobbyMessage(webSocket);
        };
      } else if (webSocket.readyState === WebSocket.OPEN) {
        // If already open, send the createLobby message
        sendCreateLobbyMessage(webSocket);
      } else {
        setError("WebSocket connection is not available. Please try again.");
      }

      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Message from server from Host Game:", data);

        if (data.roomCode) {
          setRoomCode(data.roomCode);
          dispatch(setRole("host")); // Set role as host in Redux
          navigate(`/${data.roomCode}`);
        } else {
          setError("Room code not received from server.");
          console.error("Room code not received from server:", data);
        }
      };

      webSocket.onclose = () => {
        console.log("WebSocket connection closed");
        dispatch(disconnect());
      };

      webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("An error occurred with the WebSocket connection.");
        dispatch(disconnect());
      };
    }
  };

  const sendCreateLobbyMessage = (webSocket: WebSocket) => {
    webSocket.send(
      JSON.stringify({
        action: "createLobby",
        quizName: selectedQuiz,
        hostName: hostName, // Include host name in the message
      })
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