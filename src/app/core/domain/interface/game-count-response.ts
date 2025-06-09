
export interface GameCountResponse {
  status: string;
  code: number;
  message: string;
  data: {
    hangman: number;
    memory: number;
    puzzle: number;
    solve_the_word: number;
  };
}

export interface GameCounts {
  hangman: number;
  memory: number;
  puzzle: number;
  solve_the_word: number;
}