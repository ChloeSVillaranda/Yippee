import { Box, Button, TextField, Typography } from "@mui/material";

import { RootState } from "../stores/store";
import { User } from "../stores/types";
import { executeWebSocketCommand } from "../util/websocketUtil";
import { useSelector } from "react-redux";
import { useState } from "react";

export default function LobbyRoomView() {
  const game = useSelector((state: RootState) => state.game); // get the clientsInLobby from Redux
  const [lobbyMessage, setLobbyMessage] = useState("");
  const userDetails = useSelector((state: RootState) => state.game.user); // get current user details from Redux
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = () => {
    // send a message to be displayed to the lobby
    if (!lobbyMessage.trim()) {
        console.log("can not be set empty");
        return;
    }

    // update the user details with the message sent
    const user = {
      userName: userDetails.userName,
      userRole: userDetails.userRole,
      userMessage: lobbyMessage,
      points: 0,
    } as User;
        
    // execute the "createLobby" WebSocket command
    executeWebSocketCommand(
        "sendLobbyMessage",
        { roomCode: game.roomCode, user: user },
        (errorMessage) => setError(errorMessage)
    );
    // reset the message to be blank
    setLobbyMessage("")
  }

  const handleStartGame = () => {
    // TODO: ensure that there is at least one player
    console.log("Starting the Game")
    executeWebSocketCommand(
        "startGame",
        { roomCode: game.roomCode, user: userDetails },
        (errorMessage) => setError(errorMessage)
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Room: {game.roomCode}
      </Typography>
      {/* quiz displayed for players to see */}
      {/* TODO: set it properly to the quiz instead of the host name! */}
      <Typography variant="h5" gutterBottom>
        Quiz: {game.clientsInLobby.find((user) => user.userRole === "host")?.userName || "Loading..."}
      </Typography>
      {/* host displayed */}
      <Typography variant="h5" gutterBottom>
        Host: {game.clientsInLobby.find((user) => user.userRole === "host")?.userName || "Loading..."}
        {game.clientsInLobby.find((user) => user.userRole === "host")?.userMessage && `: ${game.clientsInLobby.find((user) => user.userRole === "host")?.userMessage}`}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Players:
      </Typography>
      <Box>
        {game.clientsInLobby.length > 0 ? (
          game.clientsInLobby
            .filter((user) => user.userRole === "player") // Filter only players
            .map((player, index) => (
              <Typography key={index} variant="body1">
                {player.userName}
                {player.userMessage && `: ${player.userMessage}`}
              </Typography>
            ))
        ) : (
          <Typography variant="body1">No players connected yet.</Typography>
        )}
      </Box>
        {/* TODO: add restrictions on the messages you can send*/}
        <TextField id="message" label="Type Message" variant="outlined" fullWidth value={lobbyMessage} 
          onChange={(e) => setLobbyMessage(e.target.value)} sx={{ marginBottom: 2 }}/>
        <Button variant="contained" color="primary" onClick={handleSendMessage} fullWidth>
            Send Message
        </Button>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      {userDetails.userRole === "host" ? (
        <Box>
          <Typography variant="h5" gutterBottom>
            Host View
          </Typography>
          <Typography variant="body1">
            You are the host. Manage the game and start the quiz.
          </Typography>
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleStartGame}>
            Start Game
          </Button>
        </Box>
      ) : userDetails.userRole === "player" ? (
        <>
        <Box>
          <Typography variant="h5" gutterBottom>
            Player View
          </Typography>
          <Typography variant="body1">
            You are a player. Wait for the host to start the game.
          </Typography>
        </Box>
        </>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
}