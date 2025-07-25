import { Box, Typography, useTheme } from "@mui/material";

import HostGameView from "../components/HostGameView";
import LobbyRoomView from "../components/LobbyRoomView";
import PlayerGameView from "../components/PlayerGameView";
import { RootState } from "../stores/store";
import styles from './Game.module.css';
import { useSelector } from "react-redux";

export default function LobbyRoom() {
  const userDetails = useSelector((state: RootState) => state.game.user); // get current user details from Redux
  const lobbyStatus = useSelector((state: RootState) => state.game.gameStatus);
  const theme = useTheme();

  return (
    <div className={styles.container}>
      <Box 
        className={styles.innerBox}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark'
            ? '0px 4px 20px rgba(0, 0, 0, 0.5)'
            : '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
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
      </Box>
    </div>
  );
}