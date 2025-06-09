import { Box, Button, TextField, Typography } from "@mui/material";
import { MessageResponse, QuizQuestion, User } from "../stores/types";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import HostGameView from "../components/HostGameView";
import LobbyRoomView from "../components/LobbyRoomView";
import PlayerGameView from "../components/PlayerGameView";
import { RootState } from "../stores/store";

export default function LobbyRoom() {
  const userDetails = useSelector((state: RootState) => state.game.user); // get current user details from Redux
  const lobbyStatus = useSelector((state: RootState) => state.game.gameStatus);

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
    ) : lobbyStatus === "Completed" ? (
      <Box>
        {/* TODO: implement a final leaderboard */}
          {/* <FinalLeaderBoard /> */}
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