import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, setupWebSocketHandlers, useCheckConnection } from "../util/websocketUtil";

import { Player } from "../stores/types";
import { disconnect } from "../stores/websocketSlice";
import { setRole } from "../stores/gameSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useCheckConnection();


  const handleJoinGame = () => {
    // input room code
    if (!roomCode.trim()) {
      setError("Room code cannot be empty");
      return;
    }

    // input player name
    if (!playerName.trim()) {
      setError("Player name cannot be empty");
      return;
    }

    // Create a Player object
    const player: Player = {
      playerName: playerName,
      playerMessage: "", // Default message is empty
    };

    // execute the "createLobby" WebSocket command
    executeWebSocketCommand(
      "joinLobby",
      { roomCode: roomCode, player: player },
      (errorMessage) => setError(errorMessage) // Error callback
    );

    // set up WebSocket event handlers
    setupWebSocketHandlers(
      (data) => {
        console.log("Message from server for Join Game:", data);

        if (data.roomCode) {
          dispatch(setRole("player")); // set role as player in Redux
          navigate(`/${data.roomCode}`);
        } else {
          setError("Could not connect to the server.");
          console.error("Could not connect to the server:", data);
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
        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
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