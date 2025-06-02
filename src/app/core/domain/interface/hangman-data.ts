export interface HangmanData {
  presentation: 'A' | 'F';
  words: Array<{
    word: string;
    clue: string;
  }>;
}
