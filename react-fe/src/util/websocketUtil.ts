import * as wsMessage from "./websocketMessages";

import { useDispatch, useSelector } from "react-redux";

import { MessageResponse } from "../stores/types";
import { RootState } from "../stores/store";
import { connect } from "../stores/websocketSlice";
import { getWebSocket } from "../stores/websocketSlice";

/**
 * Checks if there is a websocket connection to the backend.
 * Create a connection if non-existent
 */
export const useCheckConnection = () => {
  const dispatch = useDispatch();
  const isConnected = useSelector((state: RootState) => state.websocket.isConnected);
  // Establish WebSocket connection if not already connected
  if (!isConnected) {
    dispatch(connect("ws://localhost:8080/ws"));
  }
}

/**
 * Executes a WebSocket command by automatically retrieving the WebSocket instance
 * and calling the respective WebSocket message function.
 * @param command - The WebSocket command to execute (e.g., "createLobby").
 * @param payload - The payload to send with the command.
 * @param onError - Optional callback for handling errors.
 */
export const executeWebSocketCommand = (
  command: string,
  payload: Record<string, any>,
  onError?: (error: string) => void
) => {
  const webSocket = getWebSocket();

  if (webSocket) {
    if (webSocket.readyState === WebSocket.CONNECTING) {
      // Wait for the WebSocket connection to open
      webSocket.onopen = () => {
        console.log("WebSocket connection established.");
        callCommandFunction(command, webSocket, payload, onError);
      };
    } else if (webSocket.readyState === WebSocket.OPEN) {
      // If already open, call the command function
      callCommandFunction(command, webSocket, payload, onError);
    } else {
      const errorMessage = "WebSocket connection is not available. Please try again.";
      console.error(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  } else {
    const errorMessage = "WebSocket instance is not available.";
    console.error(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  }
};


/**
 * Calls the respective WebSocket message function based on the command.
 * @param command - The WebSocket command to execute.
 * @param webSocket - The WebSocket connection.
 * @param payload - The payload to send with the command.
 * @param onError - Optional callback for handling errors.
 */
const callCommandFunction = (
  command: string,
  webSocket: WebSocket,
  payload: Record<string, any>,
  onError?: (error: string) => void
) => {
    // commands to send to the backend
  const commandMap: Record<string, Function> = {
    createLobby: wsMessage.sendCreateLobbyMessage,
    joinLobby: wsMessage.sendJoinLobbyMessage,
    sendLobbyMessage: wsMessage.sendLobbyMessage,
    startGame: wsMessage.startGameMessage,
  };

  const commandFunction = commandMap[command];

  if (commandFunction) {
    try {
      commandFunction(webSocket, ...Object.values(payload));
    } catch (error) {
      console.error(`Error executing command "${command}":`, error);
      if (onError) {
        onError(`Error executing command "${command}".`);
      }
    }
  } else {
    const errorMessage = `Unknown WebSocket command: "${command}".`;
    console.error(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  }
};

/**
 * Sets up WebSocket event handlers.
 * @param onMessage - Callback for handling incoming messages.
 * @param onClose - Callback for handling WebSocket closure.
 * @param onError - Callback for handling WebSocket errors.
 */
export const setupWebSocketHandlers = (
  onMessage: (data: any) => void,
  onClose: () => void,
  onError: (error: any) => void
) => {
  const webSocket = getWebSocket();

  if (webSocket) {
    webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data) as MessageResponse;
      onMessage(data);
    };

    webSocket.onclose = () => {
      console.log("WebSocket connection closed");
      onClose();
    };

    webSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      onError(error);
    };
  } else {
    console.error("WebSocket instance is not available.");
  }
};