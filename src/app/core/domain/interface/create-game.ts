import {GameSetting} from './game-setting';
import {Assessment} from './assessment';
import {HangmanData} from './hangman-data';
import {MemoryGameData} from './memory-game-data';
import {PuzzleData} from './puzzle-data';
import {SolveTheWordData} from './solve-the-word-data';
import {Difficulty} from '../enum/difficulty';
import {Visibility} from '../enum/visibility';
import {GameType} from '../enum/game-type';

export interface CreateGame {
  Name: string;
  Description: string;
  ProfessorId: number;
  Activated: boolean;
  Difficulty: Difficulty;
  Visibility: Visibility;
  settings: GameSetting[];
  assessment: Assessment;
  game_type: GameType;
  hangman?: HangmanData;
  memory?: MemoryGameData;
  puzzle?: PuzzleData;
  solve_the_word?: SolveTheWordData;
}
