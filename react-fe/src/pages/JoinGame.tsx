import { Box, Button, TextField, Typography } from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoinGame = () => {
    if (!roomCode.trim()) {
      setError("Room code cannot be empty");
      return;
    }

    // Establish WebSocket connection
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("WebSocket connection established.");

      // Send joinLobby action to validate the room
      ws.send(
        JSON.stringify({
          action: "validateRoom",
          roomCode: roomCode,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        // Handle error from the backend
        setError(data.error);
        ws.close();
      } else if (data.message === "Room exists") {
        // Redirect to the room as a player
        navigate(`/room/${roomCode}?role=player`);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to the server. Please try again.");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };
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