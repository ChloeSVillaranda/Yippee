import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import ImageIcon from '@mui/icons-material/Image';
import { Quiz } from '../stores/types';

const MAX_VISIBLE = 5;

export default function SelectQuiz({ onSelectQuiz }: { onSelectQuiz: (quiz: Quiz) => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/get-quizzes");
        if (!response.ok) throw new Error("Failed to fetch quizzes");
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const visibleQuizzes = quizzes.slice(0, MAX_VISIBLE);
  const moreQuizzes = quizzes.slice(MAX_VISIBLE);

  const handleCardClick = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setDetailsOpen(true);
  };

  const handleConfirm = () => {
    if (selectedQuiz) {
      onSelectQuiz(selectedQuiz);
      setDetailsOpen(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select a Quiz
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : quizzes.length > 0 ? (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', width: '100%', maxWidth: '100%', overflowX: 'auto', pb: 1 }}>
          {visibleQuizzes.map((quiz, index) => (
            <Box
              key={index}
              sx={{
                width: 140,
                minWidth: 140,
                border: "1px solid #ccc",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                background: '#fafafa',
                '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
                p: 1
              }}
              onClick={() => handleCardClick(quiz)}
            >
              <Box sx={{ width: '100%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, bgcolor: '#eee', borderRadius: 1 }}>
                <ImageIcon sx={{ fontSize: 48, color: '#bbb' }} />
              </Box>
              <Typography variant="subtitle1" noWrap>{quiz.quizName}</Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {quiz.quizDescription}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Created by: {quiz.createdBy}
              </Typography>
            </Box>
          ))}
          {moreQuizzes.length > 0 && (
            <Button variant="outlined" onClick={() => setDialogOpen(true)} sx={{ width: 80, minWidth: 80, height: 80, fontSize: '0.9rem', p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
              More Quizzes
            </Button>
          )}
        </Box>
      ) : (
        <Typography>No quizzes available.</Typography>
      )}
      {/* More Quizzes Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select a Quiz</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
            {moreQuizzes.map((quiz, index) => (
              <Box
                key={index}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: '#fafafa',
                  '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
                  p: 1,
                  width: 140,
                  minWidth: 140,
                  m: 1
                }}
                onClick={() => handleCardClick(quiz)}
              >
                <Box sx={{ width: '100%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, bgcolor: '#eee', borderRadius: 1 }}>
                  <ImageIcon sx={{ fontSize: 48, color: '#bbb' }} />
                </Box>
                <Typography variant="subtitle1" noWrap>{quiz.quizName}</Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  {quiz.quizDescription}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Created by: {quiz.createdBy}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
      {/* Quiz Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedQuiz?.quizName}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>{selectedQuiz?.quizDescription}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Questions:</Typography>
          {selectedQuiz?.quizQuestions && selectedQuiz.quizQuestions.length > 0 ? (
            selectedQuiz.quizQuestions.map((q, i) => (
              <Box key={i} sx={{ mb: 1 }}>
                <Typography variant="body2">{i + 1}. {q.question}</Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">No questions available.</Typography>
          )}
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">Select This Quiz</Button>
        </Box>
      </Dialog>
    </Box>
  );
}