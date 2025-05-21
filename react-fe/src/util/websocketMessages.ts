// this file stores all of the different types of WebSocket message functions that will be used to make certain calls to the backend.

import { User } from "../stores/types";

export const sendCreateLobbyMessage = (
  webSocket: WebSocket,
  quizName: string, // TODO: should not be a string later
  user: User
) => {
  webSocket.send(
    JSON.stringify({
      action: "createLobby",
      quizName: quizName,
      user: user
    })
  );
};

/**
 * Join an existing lobby.
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code to join.
 * @param user - The user.
 */
export const sendJoinLobbyMessage = (
  webSocket: WebSocket,
  roomCode: string,
  user: User,
) => {
  webSocket.send(
    JSON.stringify({
      action: "joinLobby",
      roomCode: roomCode,
      user: user,
    })
  );
};

/**
 * Sends a message to be sent to the lobby.
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code.
 * @param senderName - Name of the sender
 * @param message - The message that is being send.
 */
export const sendLobbyMessage = (
  webSocket: WebSocket,
  roomCode: string,
  user: User,
) => {
  webSocket.send(
    JSON.stringify({
      action: "sendLobbyMessage",
      roomCode: roomCode,
      user: user,
    })
  );
};