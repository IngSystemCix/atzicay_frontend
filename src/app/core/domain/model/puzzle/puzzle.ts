export class Puzzle {
  GameInstanceId: number;
  PathImg: string;
  Clue: string;
  Rows: number;
  Cols: number;
  AutomaticHelp: boolean;

  constructor(data: any) {
    this.GameInstanceId = data.GameInstanceId;
    this.PathImg = data.PathImg;
    this.Clue = data.Clue;
    this.Rows = data.Rows;
    this.Cols = data.Cols;
    this.AutomaticHelp = data.AutomaticHelp;
  }
}
