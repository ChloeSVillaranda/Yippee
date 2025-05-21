// TODO: might need to add back the player and the host because each has different actions
// object interface stores
// export interface Player {
//     playerName: string;
//     playerMessage: string;
// }

// export interface Host {
//     hostName: string;
//     hostMessage: string;
// }

interface User {
    userName: string;
    userMessage: string;
    userRole: string; 
    points: number;
}

interface MessageRequest {
    action: string; 
    user: User;
    roomCode: string | undefined; 
    quizName: string | undefined;
}

interface MessageResponse {
    messageToClient: string;
    roomCode: string | undefined;
    quiz: string | undefined;
    error: string | undefined;
    clientsInLobby: User[] | undefined;
}

export type { User , MessageRequest, MessageResponse}