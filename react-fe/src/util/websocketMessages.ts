// this file stores all of the different types of WebSocket message functions that will be used to make certain calls to the backend.

import { Player } from "../stores/types";

/**
 * Create a new lobby.
 * @param webSocket - The WebSocket connection.
 * @param quizName - The name of the quiz to be hosted.
 * @param hostName - The name of the host creating the lobby.
 */
export const sendCreateLobbyMessage = (
  webSocket: WebSocket,
  quizName: string,
  hostName: string
) => {
  webSocket.send(
    JSON.stringify({
      action: "createLobby",
      quizName: quizName,
      hostName: hostName,
    })
  );
};

/**
 * Join an existing lobby.
 * @param webSocket - The WebSocket connection.
 * @param roomCode - The room code to join.
 * @param playerName - The name of the player joining the lobby.
 */
export const sendJoinLobbyMessage = (
  webSocket: WebSocket,
  roomCode: string,
  player: Player,
) => {
  console.log(
    JSON.stringify({
      action: "joinLobby",
      roomCode: roomCode,
      player: player,
    })
  )
  webSocket.send(
    JSON.stringify({
      action: "joinLobby",
      roomCode: roomCode,
      player: player,
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
  playerMessage: string,
) => {
  webSocket.send(
    JSON.stringify({
      action: "sendLobbyMessage",
      roomCode: roomCode,
      playerMessage: playerMessage,
    })
  );
};