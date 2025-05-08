import { Box, Button, TextField, Typography } from "@mui/material";
import { connect, disconnect, setRole } from "../stores/websocketSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../stores/store";
import { getWebSocket } from "../stores/websocketSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);

  const handleJoinGame = () => {
    if (!roomCode.trim()) {
      setError("Room code cannot be empty");
      return;
    }

    // Establish WebSocket connection if not already connected
    if (!isConnected) {
      dispatch(connect("ws://localhost:8080/ws"));
    }

    const webSocket = getWebSocket();
    if (webSocket) {
      webSocket.onopen = () => {
        console.log("WebSocket connection established.");

        // Send joinLobby action to validate the room
        webSocket.send(
          JSON.stringify({
            action: "validateRoom",
            roomCode: roomCode,
          })
        );
      };

      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
          // Handle error from the backend
          setError(data.error);
          webSocket.close();
          dispatch(disconnect());
        } else if (data.message === "Room exists") {
          // Set role as player in Redux and navigate to the room
          dispatch(setRole("player"));
          navigate(`/${roomCode}`);
        }
      };

      webSocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Failed to connect to the server. Please try again.");
        dispatch(disconnect());
      };

      webSocket.onclose = () => {
        console.log("WebSocket connection closed.");
        dispatch(disconnect());
      };
    }
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Join a Game
      </Typography>
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