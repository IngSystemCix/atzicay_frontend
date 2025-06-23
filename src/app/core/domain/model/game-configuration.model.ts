export interface HangmanWord {
  word: string;
  clue: string;
  presentation: string;
}

export interface MemoryPair {
  mode: string;
  path_image1: string | null;
  path_image2: string | null;
  description_image: string | null;
}

export interface PuzzleConfig {
  path_img: string;
  clue: string;
  rows: number;
  cols: number;
  automatic_help: boolean;
}

export interface SolveTheWordWord {
  word: string;
  orientation: string;
}

export interface GameSetting {
  key: string;
  value: string;
}

export interface GameConfiguration {
  game_instance_id: number;
  game_name: string;
  game_description: string;
  difficulty: string;
  visibility: string;
  activated: boolean;
  hangman_words: HangmanWord[] | null;
  memory_pairs: MemoryPair[] | null;
  puzzle: PuzzleConfig | null;
  solve_the_word: SolveTheWordWord[] | null;
  settings: GameSetting[];
}
