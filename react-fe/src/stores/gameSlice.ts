// this slice handles the state of a game
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "./types"; 

interface GameState {
    user: User // own user
    clientsInLobby: User[];
}

const initialState = {
    user: {
        userName: "", 
        userMessage: "",
        userRole: "",
        points: 0, 
    }, 
    clientsInLobby: []
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
        upsertClientsInLobby: (state, action: PayloadAction<User[]>) => {
            state.clientsInLobby = action.payload;
        },    
    }
})

export const { setUserName, setRole, setMessage, upsertClientsInLobby} = gameSlice.actions
export default gameSlice.reducer