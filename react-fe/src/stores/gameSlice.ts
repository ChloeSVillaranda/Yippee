// this slice handles the state of a game
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GameSettings, QuizQuestion, User } from "./types"; 

interface GameState {
    user: User // own user
    clientsInLobby: User[];
    // quiz: Quiz | undefined; 
    gameSettings: GameSettings | undefined;
    currentQuestion: QuizQuestion | undefined;  
    gameStatus: string | undefined;
}

const initialState = {
    user: {
        userName: "", 
        userMessage: "",
        userRole: "",
        points: 0, 
    }, 
    clientsInLobby: [], 
    gameSettings: undefined,
    currentQuestion: undefined, 
    gameStatus: undefined,
} satisfies GameState as GameState

const gameSlice = createSlice({
    name: "game",
    initialState, 
    reducers: {
        // set name
        setUserName: (state, action: PayloadAction<string>) => {
            state.user.userName = action.payload;
        }, 
        // set the user role 
        setRole: (state, action: PayloadAction<string>) => {
            state.user.userRole = action.payload;
        },
        // send a message
        setMessage: (state, action: PayloadAction<string>) => {
            state.user.userMessage = action.payload;
        },
        // upsert players
        upsertClientsInLobby: (state, action: PayloadAction<User[]>) => {
            state.clientsInLobby = action.payload;
        },
        setGameSettings: (state, action: PayloadAction<GameSettings>) => {
            state.gameSettings = action.payload;
        },
        setCurrentQuestion: (state, action: PayloadAction<QuizQuestion>) => {
            state.currentQuestion = action.payload;
        },
        setGameStatus: (state, action: PayloadAction<string>) => {
            state.gameStatus = action.payload;
        },
    }
})

export const { ...gameActions } = gameSlice.actions
export default gameSlice.reducer