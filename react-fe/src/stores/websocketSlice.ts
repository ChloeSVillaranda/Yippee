import { PayloadAction, createSlice } from "@reduxjs/toolkit";

let webSocket: WebSocket | null = null; // Store WebSocket instance outside Redux state

interface WebSocketState {
  isConnected: boolean;
  messages: any[];
  role: string | null; // Add role to the state
}

const initialState: WebSocketState = {
  isConnected: false,
  messages: [],
  role: null, // Initialize role as null
};

const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<string>) => {
      if (!webSocket) {
        webSocket = new WebSocket(action.payload);
        state.isConnected = true;
      }
    },
    disconnect: (state) => {
      if (webSocket) {
        webSocket.close();
        webSocket = null;
        state.isConnected = false;
        state.role = null; // Reset role on disconnect
      }
    },
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload; // Set the role
    },
    addMessage: (state, action: PayloadAction<any>) => {
      state.messages.push(action.payload);
    },
  },
});

export const { connect, disconnect, setRole, addMessage } = websocketSlice.actions;
export default websocketSlice.reducer;

// Export the WebSocket instance for use in components
export const getWebSocket = () => webSocket;