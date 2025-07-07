import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import BubbleBackground from "./components/BubbleBackground";
import { Button } from "@mui/material";
import CreateQuiz from "./pages/CreateQuiz"
import Home from "./pages/Home";
import HostGame from "./pages/HostGame";
import JoinGame from "./pages/JoinGame";
import LobbyRoom from "./pages/Game";
import Navbar from "./components/Navbar";
import Resources from "./pages/Resources";
import styles from './App.module.css';

// import AnimatedCursor from "react-animated-cursor"

function AppRoutes() {
  return (
    <div className="App">
      <BubbleBackground />
      <div className="navbar">
        <Navbar />
      </div>
      {/* <AnimatedCursor outerSize={20} /> */}
      <div className={styles.contentContainer}>
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
          <Route path="/resources"
            element={<Resources />}/>      
          <Route path="/:roomCode" element={<LobbyRoom />} /> 
        </Routes>
      </div>
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