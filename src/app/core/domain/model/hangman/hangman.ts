export class Hangman {
  Id: number;
  GameInstanceId: number;
  Word: string;
  Clue: string;
  Presentation: string;

  constructor(data: any) {
    this.Id = data.Id;
    this.GameInstanceId = data.GameInstanceId;
    this.Word = data.Word;
    this.Clue = data.Clue;
    this.Presentation = data.Presentation;
  }
}
