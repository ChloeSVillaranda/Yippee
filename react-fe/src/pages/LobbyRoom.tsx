import { Box, Button, TextField, Typography } from "@mui/material";
import { executeWebSocketCommand, setupWebSocketHandlers } from "../util/websocketUtil";
import { useEffect, useState } from "react";

import { RootState } from "../stores/store";
import { upsertClientsInLobby } from "../stores/gameSlice";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function LobbyRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const clientsInLobby = useSelector((state: RootState) => state.game.clientsInLobby); // get the clientsInLobby from Redux
  const userDetails = useSelector((state: RootState) => state.game.user); // get current user details from Redux
  const [lobbyMessage, setLobbyMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // set up WebSocket event handlers
    setupWebSocketHandlers(
        (data) => {
        console.log("Message from server for Lobby Game:", data);

        if (data.messageToClient === "Lobby Update") { // TODO: there is probably a better way to handle this
          upsertClientsInLobby(data.clientsInLobby); // update the lobby
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
    console.log("sent the message: ", lobbyMessage)
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
      {/* TODO: set it properly to the quiz instead of the host name! */}
      <Typography variant="h5" gutterBottom>
        Quiz: {clientsInLobby.find((user) => user.userRole === "host")?.userName || "Loading..."}
      </Typography>
      {/* host displayed */}
      <Typography variant="h5" gutterBottom>
        Host: {clientsInLobby.find((user) => user.userRole === "host")?.userName || "Loading..."}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Players:
      </Typography>
      <Box>
        {clientsInLobby.length > 0 ? (
          clientsInLobby
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
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }}>
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