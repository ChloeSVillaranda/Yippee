import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { getWebSocket } from "../stores/websocketSlice";
import { useParams } from "react-router-dom";

export default function LobbyRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const webSocket = getWebSocket();

    if (webSocket) {
      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.role) {
          setRole(data.role);
        }

        console.log("Message from server:", data);
      };

      webSocket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    }
  }, []);

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