import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, setupWebSocketHandlers, useCheckConnection } from "../util/websocketUtil";
import { setRole, setUserName, upsertClientsInLobby } from "../stores/gameSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../stores/store";
import { disconnect } from "../stores/websocketSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function JoinGame() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const playerDetails = useSelector((state: RootState) => state.game.user); // get player details from Redux
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

    dispatch(setUserName(playerName));
    dispatch(setRole("player"));

    // execute the "createLobby" WebSocket command
    executeWebSocketCommand(
      "joinLobby",
      { roomCode: roomCode, player: playerDetails },
      (errorMessage) => setError(errorMessage)
    );

    // set up WebSocket event handlers
    setupWebSocketHandlers(
      (data) => {
        console.log("Message from server for Join Game:", data);

        if (data.roomCode) {
          // receive from backend who is already in the lobby, so update that 
          // before entering the lobby room
          upsertClientsInLobby(data.clientsInLobby);
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