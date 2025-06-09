import {
    connect,
    connectionClosed,
    connectionError,
    connectionOpened,
    disconnect,
} from "../stores/websocketSlice";

import { MessageResponse } from "../stores/types";
import { Middleware } from "@reduxjs/toolkit";
import { gameActions } from "../stores/gameSlice";

let socket: WebSocket | null = null;

export const getWebSocket = () => socket;

export const websocketMiddleware: Middleware = (store) => (next) => (action) => {
    if (connect.match(action)) {
        const url = action.payload;

        if (!socket || socket.readyState !== WebSocket.OPEN) {
            socket = new WebSocket(url);

            socket.onopen = () => {
                store.dispatch(connectionOpened());
            };

            socket.onmessage = (event) => {
                try {
                    const data: MessageResponse = JSON.parse(event.data);
                    console.log("WebSocket message:", data);

                    // Handle different message types
                    switch (data.messageToClient) {
                        case "Lobby created":
                            if (data.lobby?.roomCode) {
                                store.dispatch(gameActions.setRoomCode(data.lobby.roomCode));
                                store.dispatch(gameActions.setGameStatus("Waiting"));
                                if (data.clientsInLobby) {
                                    store.dispatch(gameActions.upsertClientsInLobby(data.clientsInLobby));
                                }
                                if (data.lobby.settings) {
                                    store.dispatch(gameActions.setGameSettings(data.lobby.settings));
                                }
                            }
                            break;

                        case "Joined lobby":
                            if (data.lobby?.roomCode) {
                                store.dispatch(gameActions.setRoomCode(data.lobby.roomCode));
                                store.dispatch(gameActions.setGameStatus(data.lobby.status || "Waiting"));
                                // store.dispatch(gameActions.upsertClientsInLobby(data.clientsInLobby));
                                if (data.clientsInLobby) {
                                    store.dispatch(gameActions.upsertClientsInLobby(data.clientsInLobby));
                                }
                                if (data.lobby.settings) {
                                    store.dispatch(gameActions.setGameSettings(data.lobby.settings));
                                }
                            }
                            break;

                        case "Lobby updated":
                            if (data.clientsInLobby) {
                                store.dispatch(gameActions.upsertClientsInLobby(data.clientsInLobby));
                            }
                            break;

                        case "Game start":
                            if (data.lobby?.status) {
                                store.dispatch(gameActions.setGameStatus(data.lobby.status));
                                if (data.lobby.currentQuestion) {
                                    store.dispatch(gameActions.setCurrentQuestion(data.lobby.currentQuestion));
                                }
                            }
                            break;

                        case "Show leaderboard":
                            store.dispatch(gameActions.setShowLeaderboard(true))
                            break;

                        case "Next question":
                            if (data.lobby?.currentQuestion) {
                                store.dispatch(gameActions.setCurrentQuestion(data.lobby.currentQuestion));
                            }
                            // reset the submittedAnswer back to false for user
                            store.dispatch(gameActions.setSubmittedAnswer(false))
                            store.dispatch(gameActions.setShowLeaderboard(false))
                            break;

                        case "Game completed":
                            if (data.lobby?.status) {
                                store.dispatch(gameActions.setGameStatus(data.lobby.status));
                            }
                            break;

                        default:
                            console.warn("Unhandled message type:", data.messageToClient);
                    }
                } catch (err) {
                    console.error("WebSocket message parse error:", err);
                    store.dispatch(connectionError("Failed to parse WebSocket message"));
                }
            };

            socket.onclose = () => {
                store.dispatch(connectionClosed());
                socket = null;
            };

            socket.onerror = (err) => {
                console.error("WebSocket error:", err);
                store.dispatch(connectionError("WebSocket error occurred"));
                socket = null;
            };
        }
    }

    if (disconnect.match(action)) {
        if (socket) {
            socket.close();
            socket = null;
            store.dispatch(connectionClosed());
        }
    }

    return next(action);
};