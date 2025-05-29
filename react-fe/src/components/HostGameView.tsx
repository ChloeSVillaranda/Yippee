import { RootState } from "../stores/store";
import { Typography } from "@mui/material";
import { useSelector } from "react-redux";

export default function HostGameView() {
  const game = useSelector((state: RootState) => state.game); // get the clientsInLobby from Redux

  return (
    <>
        <Typography variant="body1">You are the host and the game has started</Typography>
    </>
  );
}