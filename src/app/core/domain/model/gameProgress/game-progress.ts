export class GameProgress {
  Id: number;
  GameSessionId: number;
  Progress: string;

  constructor(data: any) {
    this.Id = data.Id;
    this.GameSessionId = data.GameSessionId;
    this.Progress = data.Progress;
  }
}
