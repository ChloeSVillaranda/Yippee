import { Typography } from "@mui/material";
import styles from './Resources.module.css';

export default function Resources() {
  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <Typography>
            Are you wanting to get better at trivia? 
            <br />
            Try looking at these resources to better your knowledge!
            <br />
            [insert list here]
        </Typography>
      </div> 
    </div>
  );
}