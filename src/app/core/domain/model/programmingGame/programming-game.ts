export class ProgrammingGame {
  Id: number;
  GameInstancesId: number;
  ProgrammerId: number;
  Name: string;
  Activated: boolean;
  StartTime: Date;
  EndTime: Date;
  Attempts: number;
  MaximumTime: number;

  constructor(data: any) {
    this.Id = data.Id;
    this.GameInstancesId = data.GameInstancesId;
    this.ProgrammerId = data.ProgrammerId;
    this.Name = data.Name;
    this.Activated = data.Activated;
    this.StartTime = new Date(data.StartTime);
    this.EndTime = new Date(data.EndTime);
    this.Attempts = data.Attempts;
    this.MaximumTime = data.MaximumTime;
  }
}
