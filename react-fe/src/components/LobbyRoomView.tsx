import { Box, Button, TextField, Typography } from "@mui/material";

export default function LobbyRoomView() {
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
        {clientsInLobby.find((user) => user.userRole === "host")?.userMessage && `: ${clientsInLobby.find((user) => user.userRole === "host")?.userMessage}`}
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
        {/* TODO: add restrictions on the messages you can send*/}
        <TextField id="message" label="Type Message" variant="outlined" fullWidth value={lobbyMessage} 
          onChange={(e) => setLobbyMessage(e.target.value)} sx={{ marginBottom: 2 }}/>
        <Button variant="contained" color="primary" onClick={handleSendMessage} fullWidth>
            Send Message
        </Button>
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
          <Button variant="contained" color="primary" sx={{ marginTop: 2 }} onClick={handleStartGame}>
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
        </>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
}