// this slice handles the state of a game
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Quiz, User } from "./types"; 

interface GameState {
    user: User // own user
    clientsInLobby: User[];
    quiz: Quiz | undefined; 
}

const initialState = {
    user: {
        userName: "", 
        userMessage: "",
        userRole: "",
        points: 0, 
    }, 
    clientsInLobby: [], 
    quiz: undefined, 
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
        setQuiz: (state, action: PayloadAction<Quiz>) => {
            state.quiz = action.payload; 
        },
        // send a message
        setMessage: (state, action: PayloadAction<string>) => {
            state.user.userMessage = action.payload;
        },
        // upsert players
        upsertClientsInLobby: (state, action: PayloadAction<User[]>) => {
            state.clientsInLobby = action.payload;
        },
    }
})
// export const { setUserName, setRole, setMessage, upsertClientsInLobby, setQuiz} = gameSlice.actions
export const { ...gameActions } = gameSlice.actions
export default gameSlice.reducer