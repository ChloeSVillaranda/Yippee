import { Box, Button, TextField, Typography } from "@mui/material";
import { Host, Player } from "../stores/types";
import { executeWebSocketCommand, setupWebSocketHandlers } from "../util/websocketUtil";
import { useEffect, useState } from "react";

import { RootState } from "../stores/store";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LobbyRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const role = useSelector((state: RootState) => state.websocket.role); // get role from Redux
  const [players, setPlayers] = useState<Player[]>([]); // state to store players
  const [host, setHost] = useState<Host | null>(null); // state to store host
  const [lobbyMessage, setLobbyMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // set up WebSocket event handlers
    setupWebSocketHandlers(
        (data) => {
        console.log("Message from server for Lobby Game:", data);

        if (data.action === "updateLobby") {
        setPlayers(data.players || []); // Update players list
          setHost(data.host || null); // Update host
        } else {
            console.error("Could not connect to the server:", data);
        }
        },
        () => {
        },
        (error) => {
        }
    );
    
  }, []);

  const handleSendMessage = () => {
    // send a message to be displayed to the lobby
    if (!lobbyMessage.trim()) {
        console.log("can not be set empty");
        return;
    }
    // execute the "createLobby" WebSocket command
    executeWebSocketCommand(
        "sendLobbyMessage",
        { roomCode: roomCode, playerMessage: lobbyMessage },
        (errorMessage) => setError(errorMessage) // Error callback
    );
  }

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
            <>
        <Typography key={index} variant="body1">
            {player.playerName}
            {player.playerMessage && `: ${player.playerMessage}`}
        </Typography>
            </>
          ))
        ) : (
          <Typography variant="body1">No players connected yet.</Typography>
        )}
      </Box>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
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
        <>
        <Box>
          <Typography variant="h5" gutterBottom>
            Player View
          </Typography>
          <Typography variant="body1">
            You are a player. Wait for the host to start the game.
          </Typography>
        </Box>
        {/* TODO: add restrictions on the messages you can send*/}
        <TextField id="message" label="Type Message" variant="outlined" fullWidth value={lobbyMessage} 
        onChange={(e) => setLobbyMessage(e.target.value)} sx={{ marginBottom: 2 }}/>
        <Button variant="contained" color="primary" onClick={handleSendMessage} fullWidth>
            Send Message
        </Button>
        </>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
}