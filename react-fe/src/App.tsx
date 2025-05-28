import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import CreateQuiz from "./pages/CreateQuiz"
import Home from "./pages/Home";
import HostGame from "./pages/HostGame";
import JoinGame from "./pages/JoinGame";
import LobbyRoom from "./pages/LobbyRoom";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/"
          element={<Home />}/>
        <Route path="/createquiz"
          element={<CreateQuiz />}/>
        <Route path="/host"
          element={<HostGame />}/>
        <Route path="/join"
          element={<JoinGame />}/>
        {/* TODO: make the :/roomCode protected so that you need to be a player/host to enter it */}
        <Route path="/:roomCode" element={<LobbyRoom />} /> 
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;