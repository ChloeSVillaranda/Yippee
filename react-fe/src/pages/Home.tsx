import { Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [reversedMessage, setReversedMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket("ws://localhost:8080/ws");

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "reversed") {
        setReversedMessage(data.message);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    setSocket(ws);

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const payload = {
        type: "reverse",
        message: message,
      };
      socket.send(JSON.stringify(payload));
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  return (
    <>
      <TextField
        label="Enter a message"
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" onClick={sendMessage}>
        Send Message
      </Button>
      {reversedMessage && (
        <Typography variant="h6" style={{ marginTop: "20px" }}>
          Reversed Message: {reversedMessage}
        </Typography>
      )}
    </>
  );
}