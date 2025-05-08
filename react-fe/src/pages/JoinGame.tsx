import { Box, Button, TextField, Typography } from "@mui/material";
import { connect, disconnect, setRole } from "../stores/websocketSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../stores/store";
import { getWebSocket } from "../stores/websocketSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);

  const handleJoinGame = () => {
    if (!roomCode.trim()) {
      setError("Room code cannot be empty");
      return;
    }

    if (!playerName.trim()) {
      setError("Player name cannot be empty");
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
          sendJoinLobbyMessage(webSocket);
        };
      } else if (webSocket.readyState === WebSocket.OPEN) {
        // If already open, send the joinLobby message
        sendJoinLobbyMessage(webSocket);
      } else {
        setError("WebSocket connection is not available. Please try again.");
      }

      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          // Handle error from the backend
          setError(data.error);
          webSocket.close();
          dispatch(disconnect());
        } else if (data.message === "Joined lobby successfully") {
          // Set role as player in Redux and navigate to the room
          dispatch(setRole("player"));
          navigate(`/${roomCode}`);
        }
      };

      webSocket.onclose = () => {
        console.log("WebSocket connection closed.");
        dispatch(disconnect());
      };

      webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("An error occurred with the WebSocket connection.");
        dispatch(disconnect());
      };
    }
  };

  const sendJoinLobbyMessage = (webSocket: WebSocket) => {
    webSocket.send(
      JSON.stringify({
        action: "joinLobby",
        roomCode: roomCode,
        playerName: playerName, // Include player name in the message
      })
    );
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Join a Game
      </Typography>
      <TextField
        id="player-name"
        label="Enter Your Name"
        variant="outlined"
        fullWidth
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <TextField
        id="room-code"
        label="Enter Room Code"
        variant="outlined"
        fullWidth
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())} // Convert to uppercase
        sx={{ marginBottom: 2 }}
      />
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleJoinGame} fullWidth>
        Join Game
      </Button>
    </Box>
  );
}