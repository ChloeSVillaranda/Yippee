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

export interface User {
    userName: string;
    userMessage: string;
    userRole: string; 
    points: number;
}