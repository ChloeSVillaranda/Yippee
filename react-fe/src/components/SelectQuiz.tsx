import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ImageIcon from '@mui/icons-material/Image';
import { Quiz } from '../stores/types';

const MAX_VISIBLE = 5;

export default function SelectQuiz({ onSelectQuiz }: { onSelectQuiz: (quiz: Quiz) => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questionPage, setQuestionPage] = useState(0);
  const theme = useTheme();

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
    setQuestionPage(0);
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
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                background: theme.palette.background.paper,
                '&:hover': { boxShadow: `0 4px 8px ${theme.palette.action.hover}` },
                p: 1
              }}
              onClick={() => handleCardClick(quiz)}
            >
              <Box sx={{ 
                width: '100%', 
                height: 80, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 1, 
                bgcolor: theme.palette.action.hover, 
                borderRadius: 1 
              }}>
                <ImageIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
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
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: theme.palette.background.paper,
                  '&:hover': { boxShadow: `0 4px 8px ${theme.palette.action.hover}` },
                  p: 1,
                  width: 140,
                  minWidth: 140,
                  m: 1
                }}
                onClick={() => handleCardClick(quiz)}
              >
                <Box sx={{ 
                  width: '100%', 
                  height: 80, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mb: 1, 
                  bgcolor: theme.palette.action.hover, 
                  borderRadius: 1 
                }}>
                  <ImageIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
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
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24, pb: 0 }}>{selectedQuiz?.quizName}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: theme.palette.action.hover, 
              borderRadius: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 2 
            }}>
              <ImageIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', color: theme.palette.text.secondary }}>{selectedQuiz?.quizDescription}</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>Questions:</Typography>
          <Box sx={{ 
            bgcolor: theme.palette.action.hover, 
            borderRadius: 2, 
            p: 2, 
            mb: 2, 
            minHeight: 100, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            position: 'relative' 
          }}>
            {selectedQuiz?.quizQuestions && selectedQuiz.quizQuestions.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Button
                    onClick={() => setQuestionPage((prev) => Math.max(prev - 1, 0))}
                    disabled={questionPage === 0}
                    sx={{ minWidth: 0, p: 1 }}
                  >
                    <ArrowBackIosNewIcon fontSize="small" />
                  </Button>
                  <Box sx={{ flex: 1, px: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {questionPage + 1}. {selectedQuiz.quizQuestions[questionPage].question}
                    </Typography>
                    {/* Show answers if available */}
                    {selectedQuiz.quizQuestions[questionPage].correctAnswers && selectedQuiz.quizQuestions[questionPage].incorrectAnswers ? (
                      <Box>
                        {[...(selectedQuiz.quizQuestions[questionPage].correctAnswers || []), ...(selectedQuiz.quizQuestions[questionPage].incorrectAnswers || [])].map((ans, idx) => (
                          <Typography key={idx} variant="body2" sx={{ ml: 2, color: selectedQuiz.quizQuestions[questionPage].correctAnswers.includes(ans) ? 'success.main' : 'text.secondary' }}>
                            - {ans}
                          </Typography>
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                  <Button
                    onClick={() => setQuestionPage((prev) => Math.min(prev + 1, selectedQuiz.quizQuestions.length - 1))}
                    disabled={questionPage === selectedQuiz.quizQuestions.length - 1}
                    sx={{ minWidth: 0, p: 1 }}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Question {questionPage + 1} of {selectedQuiz.quizQuestions.length}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">No questions available.</Typography>
            )}
          </Box>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Button 
            onClick={() => setDetailsOpen(false)} 
            variant="outlined"
            sx={{
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : undefined,
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            color="primary"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : undefined,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            Select This Quiz
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}