import { Box, Button, TextField, Typography } from "@mui/material";
import { MessageResponse, QuizQuestion, User } from "../stores/types";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import HostGameView from "../components/HostGameView";
import LobbyRoomView from "../components/LobbyRoomView";
import PlayerGameView from "../components/PlayerGameView";
import { RootState } from "../stores/store";
import { gameActions } from "../stores/gameSlice";
import { setupWebSocketHandlers } from "../util/websocketUtil";

export default function LobbyRoom() {
  const userDetails = useSelector((state: RootState) => state.game.user); // get current user details from Redux
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
          dispatch(gameActions.setCurrentQuestion(data.lobby.currentQuestion as QuizQuestion))
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
    
  }, [dispatch]);

  return (
    <>
    {lobbyStatus === "Waiting" ? (
      <LobbyRoomView />
    ) : lobbyStatus === "In-Progress" ? (
      userDetails.userRole === "host" ? (
        <HostGameView />
      ) : (
        <PlayerGameView />
      )
    ) : lobbyStatus === "Finished" ? (
      <Box>
        {/* TODO: implement a leaderboard */}
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