import { Box, CircularProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import SelectQuiz from '../components/SelectQuiz'

export default function HostGame() {
  return (
    <Box sx={{ padding: 4 }}>
        <SelectQuiz />
    </Box>
  );
}