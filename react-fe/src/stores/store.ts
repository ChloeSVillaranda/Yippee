import { configureStore } from "@reduxjs/toolkit";
import websocketReducer from "./websocketSlice";

const store = configureStore({
  reducer: {
    websocket: websocketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;