import { Box, Slider, Typography } from '@mui/material';

import React from 'react';

interface DifficultySliderProps {
    difficulty: number;
    onChange: (value: number) => void;
}

export const DifficultySlider: React.FC<DifficultySliderProps> = ({ 
    difficulty, 
    onChange 
}) => {
    const handleChange = (_event: Event, newValue: number | number[]) => {
        onChange(newValue as number);
    };

    const getDifficultyLabel = (value: number) => {
        if (value <= 3) return 'Easy';
        if (value <= 6) return 'Medium';
        return 'Hard';
    };

    const getDifficultyColor = (value: number) => {
        // Create gradient from light pink to dark pink
        const colors = [
            '#FFE4E8', // Very light pink (Easy)
            '#FFD0D9',
            '#FFBCCA',
            '#FFA8BB',
            '#FF94AC',
            '#FF809D',
            '#FF6B8E',
            '#FF577F',
            '#FF4370',
            '#FF2F61'  // Dark pink (Hard)
        ];
        return colors[value - 1];
    };

    return (
        <Box sx={{ 
            width: '100%', 
            maxWidth: 400,
            margin: '20px auto',
            padding: '10px 20px'
        }}>
            <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                    textAlign: 'center',
                }}
            >
                Difficulty: {difficulty} - {getDifficultyLabel(difficulty)}
            </Typography>
            <Slider
                value={difficulty}
                onChange={handleChange}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{
                    height: 8,
                    '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                        backgroundColor: getDifficultyColor(difficulty),
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0 0 0 8px ${getDifficultyColor(difficulty)}40`
                        }
                    },
                    '& .MuiSlider-track': {
                        background: `linear-gradient(to right, #FFE4E8, ${getDifficultyColor(difficulty)})`,
                        height: 8,
                        border: 'none'
                    },
                    '& .MuiSlider-rail': {
                        background: 'linear-gradient(to right, #FFE4E8, #FF2F61)',
                        height: 8,
                        opacity: 0.5
                    },
                    '& .MuiSlider-mark': {
                        backgroundColor: '#fff',
                        height: 8,
                        width: 2,
                        '&.MuiSlider-markActive': {
                            backgroundColor: '#fff',
                            opacity: 0.8
                        }
                    }
                }}
            />
        </Box>
    );
};