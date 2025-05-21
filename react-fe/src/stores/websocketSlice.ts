import { PayloadAction, createSlice } from "@reduxjs/toolkit";

let webSocket: WebSocket | null = null;

interface WebSocketState {
  isConnected: boolean;
}

const initialState: WebSocketState = {
  isConnected: false,
};

const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    connect: (state, action: PayloadAction<string>) => {
      if (!webSocket) {
        webSocket = new WebSocket(action.payload);
        state.isConnected = true;

        // set up global message listener
        webSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Message received:", data);
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
  },
});

export const { connect, disconnect } = websocketSlice.actions;
export default websocketSlice.reducer;
 
// export the WebSocket instance for use in components
export const getWebSocket = () => webSocket;