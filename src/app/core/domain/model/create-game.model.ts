export interface GameSetting {
  ConfigKey: string;
  ConfigValue: string;
}

export interface HangmanWord {
  Word: string;
  Clue?: string;
  Presentation?: string;
}

export interface SolveTheWordWord {
  Word: string;
  Orientation: 'HL' | 'HR' | 'VU' | 'VD' | 'DU' | 'DD'; // Orientaciones válidas según backend
}

export interface CreateGame {
  Name: string;
  Description: string;
  Activated: boolean;
  Difficulty: string;
  Visibility: string;
  Rows?: number;
  Cols?: number;
  Words?: SolveTheWordWord[] | HangmanWord[];
  Settings?: GameSetting[];
  // Otros campos para otros tipos de juego
  Word?: string;
  Clue?: string;
  Presentation?: string;
  // Memory
  Mode?: string;
  PathImage1?: string;
  PathImage2?: string;
  // Puzzle
  PathImg?: string;
  AutomaticHelp?: number;
}
