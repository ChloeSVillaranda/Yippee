// this slice handles the state of a game
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "./types"; 

interface GameState {
    user: User
    players: User[];
}

const initialState = {
    user: {
        userName: "", 
        userMessage: "",
        userRole: "",
        points: 0, 
    }, 
    players: []
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
            state.user.userRole = action.payload;
        },
        // upsert players
        upsertPlayers: (state, action: PayloadAction<User[]>) => {
            state.players = action.payload;
        },    }
})

export const { setUserName, setRole, setMessage, upsertPlayers} = gameSlice.actions
export default gameSlice.reducer