import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import CreateQuiz from "./pages/CreateQuiz"
import Home from "./pages/Home";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/"
          element={<Home />}/>
        <Route path="/createquiz"
          element={<CreateQuiz />}/>
        {/* <Route path="/host"
          element={<Host />}/>
        <Route path="/join"
          element={<Join />}/> */}
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