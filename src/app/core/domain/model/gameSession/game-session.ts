export class GameSession {
  Id: number;
  ProgrammingGameId: number;
  StudentId: number;
  Duration: number;
  Won: boolean;
  DateGame: Date;

  constructor(data: any) {
    this.Id = data.Id;
    this.ProgrammingGameId = data.ProgrammingGameId;
    this.StudentId = data.StudentId;
    this.Duration = data.Duration;
    this.Won = data.Won;
    this.DateGame = new Date(data.DateGame);
  }
}
