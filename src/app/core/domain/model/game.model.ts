export interface Game {
  id: number;
  title: string;
  level: string;
  description: string;
  rating: number;
  author: string;
  image: string;
  type: 'Hangman' | 'Memory' | 'Puzzle' | 'Solve the Word';
}
