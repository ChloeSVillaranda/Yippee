import { Box, Button, Typography } from "@mui/material";
import { connect, disconnect, setRole } from "../stores/websocketSlice";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../stores/store";
import SelectQuiz from "../components/SelectQuiz";
import { getWebSocket } from "../stores/websocketSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HostGame() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);

  const handleSelectQuiz = (quizName: string) => {
    setSelectedQuiz(quizName);
  };

  const handleHostGame = () => {
    if (!selectedQuiz) {
      alert("Please select a quiz first!");
      return;
    }

    if (!isConnected) {
      dispatch(connect("ws://localhost:8080/ws"));
    }

    const webSocket = getWebSocket();
    if (webSocket) {
      webSocket.onopen = () => {
        webSocket.send(
          JSON.stringify({
            action: "createLobby",
            quizName: selectedQuiz,
          })
        );
      };

      webSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Message from server from Host Game:", data);

        if (data.roomCode) {
          setRoomCode(data.roomCode);
          dispatch(setRole("host")); // Set role as host in Redux
          navigate(`/${data.roomCode}`);
        } else {
          console.error("Room code not received from server:", data);
        }
      };

      webSocket.onclose = () => {
        console.log("WebSocket connection closed");
        dispatch(disconnect());
      };
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Host a Game
      </Typography>
      <SelectQuiz onSelectQuiz={handleSelectQuiz} />
      {selectedQuiz && (
        <Typography variant="h6" gutterBottom>
          Selected Quiz: {selectedQuiz}
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleHostGame}
        sx={{ marginTop: 2 }}
      >
        Host Game
      </Button>
      {roomCode && (
        <Typography variant="h5" sx={{ marginTop: 2 }}>
          Room Code: {roomCode}
        </Typography>
      )}
    </Box>
  );
}