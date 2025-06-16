import BubbleBackground from '../components/BubbleBackground';
import { Button } from "@mui/material";
import styles from './Home.module.css';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  return (
    <>
      <BubbleBackground />
      <div className={styles.buttonContainer}>
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
      </div>
    </>
  );
}