// this file for now stores all the interfaces
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

export type Quiz = {
    quizName: string;
    quizDescription: string;
    user: string;
    questions: {
      question: string;
      points: number;
      difficulty: number;
      hint: string;
      category: string[];
      options: string[];
      answer: number;
    }[];
  };
  
export type User = {
    userName: string;
    userMessage: string;
    userRole: string; 
    points: number;
}

export type MessageRequest = {
    action: string; 
    user: User;
    roomCode: string | undefined; 
    quiz: Quiz | undefined;
}

export type MessageResponse = {
    messageToClient: string;
    roomCode: string | undefined;
    quiz: Quiz | undefined;
    error: string | undefined;
    clientsInLobby: User[] | undefined;
}
