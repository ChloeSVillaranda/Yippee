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
      <div className={styles.buttonContainer}>
        <Button className={styles.button} variant="contained" onClick={() => {navigate(`/host`)}}>
          Host Game
        </Button>
        <Button className={styles.button} variant="contained" onClick={() => {navigate(`/join`)}}>
          Join Game
        </Button>
        <Button className={styles.button} variant="contained" onClick={() => {navigate(`/create-quiz`)}}>
          Create Quiz
        </Button>
        <Button className={styles.button} variant="contained" onClick={() => {navigate(`/resources`)}}>
          Resources
        </Button>
      </div>
    </>
  );
}