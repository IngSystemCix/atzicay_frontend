export interface HangmanFormData {
  name: string;
  description: string;
  professorId: number;
  difficulty: 'E' | 'M' | 'H';
  visibility: 'P' | 'R';
  presentation: 'A' | 'F';
  showClues: boolean;
  words: Array<{
    word: string;
    clue: string;
  }>;

  timeLimit?: number;
  theme?: string;
  font?: string;
  backgroundColor?: string;
  fontColor?: string;
  successMessage?: string;
  failureMessage?: string;
  assessmentValue?: number;
  assessmentComments?: string;
}
