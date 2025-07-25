import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Button, ThemeProvider, createTheme } from "@mui/material";
import type { Dispatch, SetStateAction } from 'react';

import BubbleBackground from "./components/BubbleBackground";
import CreateQuiz from "./pages/CreateQuiz";
import Home from "./pages/Home";
import HostGame from "./pages/HostGame";
import JoinGame from "./pages/JoinGame";
import LobbyRoom from "./pages/Game";
import Navbar from "./components/Navbar";
import Resources from "./pages/Resources";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import styles from './App.module.css';
import { useState } from "react";

const themes = {
  pink: createTheme({
    palette: {
      primary: { main: '#FF6B95' },
      secondary: { main: '#ec407a' },
    },
  }),
  blue: createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#64b5f6' },
    },
  }),
};

type ThemeName = 'pink' | 'blue';
function AppRoutes({ theme, setTheme }: { theme: ThemeName, setTheme: Dispatch<SetStateAction<ThemeName>> }) {
  return (
    <div className="App">
      <BubbleBackground />
      <div className="navbar">
        <Navbar theme={theme} setTheme={setTheme} />
      </div>
      <div className={styles.contentContainer}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/host" element={<HostGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/:roomCode" element={<LobbyRoom />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState<ThemeName>('pink');
  return (
    <ThemeProvider theme={themes[theme]}>
      <BrowserRouter>
        <AppRoutes theme={theme} setTheme={setTheme} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;