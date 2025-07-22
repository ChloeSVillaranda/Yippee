import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, useCheckConnection } from "../util/websocketUtil";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { RootState } from "../stores/store";
import { gameActions } from "../stores/gameSlice";
import styles from './JoinGame.module.css';
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
    console.log('Navigation check:', { roomCode });
    if (roomCode) {
      navigate(`/${roomCode}`)
    }
  }, [roomCode, navigate]);

  const handleJoinGame = async () => {
    // input room code
    const errors: string[] = [];
    if (!roomCodeToJoin.trim()) {
      errors.push("Room code cannot be empty");
    }
    // input player name
    if (!playerName.trim()) {
      errors.push("Player name cannot be empty");
    }
    // Display errors if any
    if (errors.length > 0) {
      setError(errors.join("\n"));
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
    <div className={styles.container}>
      <div className={styles.formBox}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          Join a Game
        </Typography>
        <TextField
          id="player-name"
          label="Enter Your Name"
          variant="outlined"
          fullWidth
          value={playerName}
          onChange={(e) => {
            if (e.target.value.length <= 20) {
              setPlayerName(e.target.value);
            }
          }}
          slotProps={{ htmlInput: { maxLength: 20 }}}
          helperText={`${playerName.length}/20 characters`}
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
          <Typography color="error" sx={{ marginBottom: 2, whiteSpace: 'pre-line' }}>
            {error}
          </Typography>
        )}
        <div className={styles.buttonDiv}>
          <Button variant="contained" color="primary" onClick={handleJoinGame} className={styles.button}>
            Join Game
          </Button>
        </div>
      </div>
    </div>
  );
}