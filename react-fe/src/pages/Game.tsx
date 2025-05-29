import { Box, Button, TextField, Typography } from "@mui/material";
import { MessageResponse, User } from "../stores/types";
import { executeWebSocketCommand, setupWebSocketHandlers } from "../util/websocketUtil";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import HostGameView from "../components/HostGameView";
import LobbyRoomView from "../components/LobbyRoomView";
import PlayerGameView from "../components/PlayerGameView";
import { RootState } from "../stores/store";
import { gameActions } from "../stores/gameSlice";
import { useParams } from "react-router-dom";

export default function LobbyRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const clientsInLobby = useSelector((state: RootState) => state.game.clientsInLobby); // get the clientsInLobby from Redux
  const userDetails = useSelector((state: RootState) => state.game.user); // get current user details from Redux
  const [lobbyMessage, setLobbyMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const lobbyStatus = useSelector((state: RootState) => state.game.gameStatus);

  useEffect(() => {
    // set up WebSocket event handlers
    setupWebSocketHandlers(
        (data) => {
        console.log("Message from server for Lobby Game:", data as MessageResponse);
        
        if(data.messageToClient == "Lobby updated") {
          dispatch(gameActions.upsertClientsInLobby(data.clientsInLobby));
        } else if(data.messageToClient == "Game start") {
          dispatch(gameActions.setGameStatus(data.lobby.status))
        }
        else {
          console.error("Issue with updating the clients in lobby")
        }
        },
        () => {
        },
        (error) => {
        }
    );
    
  }, [clientsInLobby]);

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
        { roomCode: roomCode, user: user },
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
        { roomCode: roomCode, user: userDetails },
        (errorMessage) => setError(errorMessage)
    );
  }

  return (
    <>
    {lobbyStatus === "Waiting" ? (
      <LobbyRoomView />

    ) : lobbyStatus === "In-Progress" ? (
      <HostGameView />

    ) : lobbyStatus === "Finished" ? (
      <Box>
          <Typography variant="h5" gutterBottom>
            Game has ended.
          </Typography>
      </Box>

    ) : (
      // TODO: handle case where there is no lobbyStatus
      <Box>
          <Typography variant="h5" gutterBottom>
            Error.
          </Typography>
      </Box>
    )}
    </>
  );
}