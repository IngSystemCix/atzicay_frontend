export class Hangman {
  Id?: number;
  GameInstanceId: number;
  Word: string;
  Clue: string;
  PresentationType: 'A' | 'F';

  constructor(data: any) {
    this.Id = data.Id;
    this.GameInstanceId = data.GameInstanceId;
    this.Word = data.Word;
    this.Clue = data.Clue;
    this.PresentationType = data.PresentationType;
  }
}
