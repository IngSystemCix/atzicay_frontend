export interface GameInstance {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  author: string;
  type_game: 'hangman' | 'memory' | 'puzzle' | 'solve_the_word';
  rating: number;
  game_instance_id: number;
  author_id: number;
}
