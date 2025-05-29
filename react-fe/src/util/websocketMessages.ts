// this file stores all of the different types of WebSocket message functions that will be used to make certain calls to the backend.

import { Quiz, User } from "../stores/types";

/**
 * Creates a Lobby
 * @param webSocket - The WebSocket connection.
 * @param quiz - The quiz that the game will be using.
 * @param user - The host requesting to make a lobby. 
 */
export const sendCreateLobbyMessage = (
  webSocket: WebSocket,
  quiz: Quiz,
  user: User
) => {
  webSocket.send(
    JSON.stringify({
      action: "createLobby",
      quiz: quiz,
      user: user
    })
  );
};

/**
 * Join an existing lobby.
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code to join.
 * @param user - The player joining the lobby.
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
 * @param user - User sending the message.
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


/**
 * Sends a request to the backend to start the game.
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code.
 * @param user - User (Host only).
 */
export const startGameMessage = (
  webSocket: WebSocket,
  roomCode: string,
  user: User,
) => {
  webSocket.send(
    JSON.stringify({
      action: "startGame",
      roomCode: roomCode,
      user: user,
    })
  );
};

/**
 * Submits an answer and sends it to the backend.
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code.
 * @param user - User (Host only).
 */
export const submitAnswer = (
  webSocket: WebSocket,
  roomCode: string,
  user: User,
  answer: number, 
) => {
  webSocket.send(
    JSON.stringify({
      action: "submitAnswer",
      roomCode: roomCode,
      user: user,
      answer: answer
    })
  );
};

/**
 * Moves onto the next question
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code.
 * @param user - User (Host only).
 */
export const nextQuestion = (
  webSocket: WebSocket,
  roomCode: string,
  user: User,
) => {
  webSocket.send(
    JSON.stringify({
      action: "nextQuestion",
      roomCode: roomCode,
      user: user,
    })
  );
};