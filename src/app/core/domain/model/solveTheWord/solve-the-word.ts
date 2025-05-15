export class SolveTheWord {
  GameInstanceId: number;
  Rows: number;
  Cols: number;

  constructor(data: any) {
    this.GameInstanceId = data.GameInstanceId;
    this.Rows = data.Rows;
    this.Cols = data.Cols;
  }
}
