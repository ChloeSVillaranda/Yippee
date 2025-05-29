// this slice handles the state of a game
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { GameSettings, QuizQuestion, User } from "./types"; 

interface GameState {
    user: User; // own user
    roomCode: string;
    clientsInLobby: User[];
    // quiz: Quiz | undefined; 
    gameSettings: GameSettings | undefined;
    currentQuestion: QuizQuestion | undefined;  
    gameStatus: string;
}

const initialState = {
    user: {
        userName: "", 
        userMessage: "",
        userRole: "",
        points: 0, 
    }, 
    roomCode: "", 
    clientsInLobby: [], 
    gameSettings: undefined,
    currentQuestion: undefined, 
    gameStatus: "",
} satisfies GameState as GameState

const gameSlice = createSlice({
    name: "game",
    initialState, 
    reducers: {
        // set name
        setUserName: (state, action: PayloadAction<string>) => {
            state.user.userName = action.payload;
            console.log("state changed: ", state.user.userName)
        }, 
        setRoomCode: (state, action: PayloadAction<string>) => {
            state.roomCode = action.payload;
            console.log("state changed: ", state.roomCode)
        },         
        // set the user role 
        setRole: (state, action: PayloadAction<string>) => {
            state.user.userRole = action.payload;
            console.log("state changed: ", state.user.userRole)
        },
        // send a message
        setMessage: (state, action: PayloadAction<string>) => {
            state.user.userMessage = action.payload;
            console.log("state changed: ", state.user.userMessage)
        },
        // upsert players
        upsertClientsInLobby: (state, action: PayloadAction<User[]>) => {
            state.clientsInLobby = action.payload;
            console.log("state changed: ", state.clientsInLobby)
        },
        setGameSettings: (state, action: PayloadAction<GameSettings>) => {
            state.gameSettings = action.payload;
            console.log("state changed: ", state.gameSettings)
        },
        setCurrentQuestion: (state, action: PayloadAction<QuizQuestion>) => {
            state.currentQuestion = action.payload;
            console.log("state changed: ", state.currentQuestion)
        },
        setGameStatus: (state, action: PayloadAction<string>) => {
            state.gameStatus = action.payload;
            console.log("state changed: ", state.gameStatus)
        },
    }
})

export const { ...gameActions } = gameSlice.actions
export default gameSlice.reducer