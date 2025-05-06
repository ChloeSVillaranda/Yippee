import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import CreateQuiz from "./pages/CreateQuiz"
import Home from "./pages/Home";
// import HostGame from "./pages/HostGame";
import JoinGame from "./pages/JoinGame";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/"
          element={<Home />}/>
        <Route path="/createquiz"
          element={<CreateQuiz />}/>
        {/* <Route path="/host"
          element={<HostGame />}/> */}
        <Route path="/join"
          element={<JoinGame />}/>
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