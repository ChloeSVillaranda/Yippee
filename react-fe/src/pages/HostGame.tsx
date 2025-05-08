import { Box, Button, Typography } from "@mui/material";

import SelectQuiz from "../components/SelectQuiz";
import { useState } from "react";

export default function HostGame() {
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  // select quiz for game
  const handleSelectQuiz = (quizName: string) => {
    setSelectedQuiz(quizName);
  };

  const handleHostGame = () => {
    if (!selectedQuiz) {
      alert("Please select a quiz first!");
      return;
    }
  
    const ws = new WebSocket("ws://localhost:8080/ws");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: "createLobby",
          quizName: selectedQuiz,
        })
      );
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server:", data);
  
      if (data.roomCode) {
        setRoomCode(data.roomCode);
        window.location.href = `/${data.roomCode}`;
      } else {
        console.error("Room code not received from server:", data);
      }
    };
  
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
  
    setWebSocket(ws);
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