import { Button } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  return (
    <>
      <Button variant="contained" onClick={() => {navigate(`/host`)}}>
        Host Game
      </Button>
      <Button variant="contained" onClick={() => {navigate(`/join`)}}>
        Join Game
      </Button>
      <Button variant="contained" onClick={() => {navigate(`/create-quiz`)}}>
        Create Quiz
      </Button>
      <Button variant="contained" >
        Resources
      </Button>
    </>
  );
}