export interface GameInstance {
  Name: string;
  Description: string;
  ProfessorId: number;
  Activated: boolean;
  Difficulty: 'E' | 'M' | 'H';
  Visibility: 'P' | 'R';
  settings: { ConfigKey: string; ConfigValue: string }[];
  assessment: {
    value: number;
    comments: string;
  };
  game_type: string;
  hangman: {
    word: string;
    clue: string;
    presentation: 'A' | 'F';
  };
}
