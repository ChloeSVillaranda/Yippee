import { PayloadAction, createSlice } from "@reduxjs/toolkit";

let webSocket: WebSocket | null = null;

interface WebSocketState {
  isConnected: boolean;
  messages: any[]; // Store received messages
  role: string | null;
}

const initialState: WebSocketState = {
  isConnected: false,
  messages: [],
  role: null,
};

const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<string>) => {
      if (!webSocket) {
        webSocket = new WebSocket(action.payload);
        state.isConnected = true;

        // Set up global message listener
        webSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Message received:", data);

          // Handle specific actions
          if (data.action === "updateLobby") {
            console.log("Lobby updated:", data);
          }
        };

        webSocket.onclose = () => {
          console.log("WebSocket connection closed.");
          state.isConnected = false;
          webSocket = null;
        };

        webSocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          state.isConnected = false;
          webSocket = null;
        };
      }
    },
    disconnect: (state) => {
      if (webSocket) {
        webSocket.close();
        webSocket = null;
        state.isConnected = false;
      }
    },
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
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