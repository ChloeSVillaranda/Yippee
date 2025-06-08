// leaderboard

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { RootState } from '../stores/store';
import { useSelector } from 'react-redux';

export default function Leaderboard() {
    const game = useSelector((state: RootState) => state.game);

    // sort users by points in descending order
    const sortedUsers = Object.values(game.clientsInLobby).sort((a, b) => b.points - a.points);

    return (
        <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto', p: 2 }}>
            <Typography variant="h4" gutterBottom align="center">
                Leaderboard
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell align="right">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers.map((user, index) => (
                            <TableRow 
                                key={user.userName}
                                sx={{ 
                                    backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'inherit',
                                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                }}
                            >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    {user.userName}
                                    {user.userName === game.user.userName && ' (You)'}
                                </TableCell>
                                <TableCell align="right">{user.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}