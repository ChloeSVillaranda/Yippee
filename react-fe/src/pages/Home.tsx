import { Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [reversedMessage, setReversedMessage] = useState("");
  // used to navigate to different pages
  let navigate = useNavigate();

  useEffect(() => {
  }, []);

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
      {reversedMessage && (
        <Typography variant="h6" style={{ marginTop: "20px" }}>
          Reversed Message: {reversedMessage}
        </Typography>
      )}

      <Button variant="contained" onClick={() => {navigate(`/host`)}}>
        Host Game
      </Button>
      <Button variant="contained" onClick={() => {navigate(`/join`)}}>
        Join Game
      </Button>
    </>
  );
}