import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// import AnimatedCursor from "react-animated-cursor"
import BubbleBackground from "./components/BubbleBackground";
import CreateQuiz from "./pages/CreateQuiz"
import Home from "./pages/Home";
import HostGame from "./pages/HostGame";
import JoinGame from "./pages/JoinGame";
import LobbyRoom from "./pages/Game";

function AppRoutes() {
  return (
    <div className="App">
      {/* <BubbleBackground /> */}
      {/* <AnimatedCursor outerSize={20} /> */}
      <Routes>
        <Route path="/"
          element={<Home />}/>
        <Route path="/create-quiz"
          element={<CreateQuiz />}/>
        <Route path="/host"
          element={<HostGame />}/>
        <Route path="/join"
          element={<JoinGame />}/>
        {/* TODO: make the :/roomCode protected so that you need to be a player/host to enter it */}
        <Route path="/:roomCode" element={<LobbyRoom />} /> 
      </Routes>
    </div>
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