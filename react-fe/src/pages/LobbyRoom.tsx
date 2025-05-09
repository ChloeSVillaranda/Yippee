import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { RootState } from "../stores/store";
import { getWebSocket } from "../stores/websocketSlice";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

interface Player {
  playerName: string;
}

interface Host {
  hostName: string;
}

export default function LobbyRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const role = useSelector((state: RootState) => state.websocket.role); // Get role from Redux
  const [players, setPlayers] = useState<Player[]>([]); // State to store players
  const [host, setHost] = useState<Host | null>(null); // State to store host

  useEffect(() => {
    const webSocket = getWebSocket();

    if (webSocket) {
      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log("Message from server from LobbyRoom:", data);

        if (data.action === "updateLobby") {
          setPlayers(data.players || []); // Update players list
          setHost(data.host || null); // Update host
        }
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
      {/* quiz displayed for players to see */}
      <Typography variant="h5" gutterBottom>
        Quiz: {host?.hostName || "Loading..."}
      </Typography>
      {/* host displayed */}
      <Typography variant="h5" gutterBottom>
        Host: {host?.hostName || "Loading..."}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Players:
      </Typography>
      <Box>
        {players.length > 0 ? (
          players.map((player, index) => (
            <Typography key={index} variant="body1">
              {player.playerName}
            </Typography>
          ))
        ) : (
          <Typography variant="body1">No players connected yet.</Typography>
        )}
      </Box>
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