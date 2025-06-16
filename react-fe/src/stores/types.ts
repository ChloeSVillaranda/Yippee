export type Quiz = {
    quizName: string;
    quizDescription: string;
    user: string;
    questions: QuizQuestion[];
};

export type QuizQuestion = {
  question: string;
  points: number;
  difficulty: number;
  hint: string;
  category: string[];
  // incorrectAnswers: string[];
  correctAnswers: string[];
  options: string[];
  type: string;
}

export type Settings = {
  questionTime: number;
  enableMessages: boolean;
  showMessagesDuringGame: boolean;
  showLeaderboard: boolean;
  shuffleQuestions: boolean;
}
  
export type User = {
  userName: string;
  userMessage: string;
  userRole: string; 
  points: number;
  submittedAnswer: boolean;
}

export type Lobby  = {
  roomCode: string;
  quiz: Quiz;
  clientsInLobby: User[];
  status: string;
  settings: Settings;
  currentQuestionIndex: number // TODO: might need to remove as not needed in the front-end
  currentQuestion: QuizQuestion
  timer: number // remove as needed
  timeRemaining: number // remove as needed
}

export type MessageRequest = {
    action: string; 
    user: User;
    roomCode: string | undefined; 
    quiz: Quiz | undefined;
}

export type MessageResponse = {
    messageToClient: string;
    error: string | undefined;
    lobby: Lobby | undefined;
    clientsInLobby: User[] | undefined;
}
