// redux middleware

import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import websocketReducer from "./websocketSlice";

const store = configureStore({
  reducer: {
    websocket: websocketReducer,
    game: gameReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;