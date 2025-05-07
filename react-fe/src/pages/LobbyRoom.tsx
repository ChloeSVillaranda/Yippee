import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

export default function LobbyRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [role, setRole] = useState<string | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log(`Connected to room: ${roomCode}`);

      // Send a message to join the lobby
      ws.send(
        JSON.stringify({
          action: "joinLobby",
          roomCode: roomCode,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.role) {
        setRole(data.role);
      }

      console.log("Message from server:", data);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomCode]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Room: {roomCode}
      </Typography>
      {role === "host" ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            Host View
          </Typography>
          <Typography variant="body1">
            You are the host. Manage the game and start the quiz.
          </Typography>
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Start Game
          </Button>
        </Box>
      ) : role === "player" ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            Player View
          </Typography>
          <Typography variant="body1">
            You are a player. Wait for the host to start the game.
          </Typography>
        </Box>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
}