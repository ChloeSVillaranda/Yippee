import { Box, Button, TextField, Typography } from "@mui/material";
import { MessageResponse, User } from "../stores/types";
import { executeWebSocketCommand, useCheckConnection } from "../util/websocketUtil";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { RootState } from "../stores/store";
import { disconnect } from "../stores/websocketSlice";
import { gameActions } from "../stores/gameSlice";
import { useNavigate } from "react-router-dom";

export default function JoinGame() {
  const [roomCodeToJoin, setRoomCodeToJoin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // get necessary states from Redux
  const currentUser = useSelector((state: RootState) => state.game.user);
  const roomCode = useSelector((state: RootState) => state.game.roomCode);
  const gameStatus = useSelector((state: RootState) => state.game.gameStatus);
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);
  
  useCheckConnection();

  useEffect(() => {
    if (roomCode) {
      navigate(`/${roomCode}`)
    }
  }, [roomCode, gameStatus, navigate]);

  const handleJoinGame = async () => {
    // input room code
    if (!roomCodeToJoin.trim()) {
      setError("Room code cannot be empty");
      return;
    }

    // input player name
    if (!playerName.trim()) {
      setError("Player name cannot be empty");
      return;
    }

    dispatch(gameActions.setUserName(playerName))
    dispatch(gameActions.setRole("player"))

    // TODO: figure out how to use the updated state instead of creating an object to pass 
    const user = {
      userName: playerName,
      userRole: "player",
      userMessage: "",
      points: 0,
    };

    // execute the "createLobby" WebSocket command
    executeWebSocketCommand(
      "joinLobby",
      { roomCode: roomCodeToJoin, player: user },
      (errorMessage) => setError(errorMessage)
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
        value={roomCodeToJoin}
        onChange={(e) => setRoomCodeToJoin(e.target.value.toUpperCase())}
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