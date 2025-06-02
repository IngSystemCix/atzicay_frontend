export class Assessment {
  Id:number;
  Activated:boolean;
  GameInstanceId:number;
  UserId:number;
  Value:number;
  Comments:string;

  constructor(data: any) {
    this.Id = data.Id;
    this.Activated = data.Activated;
    this.GameInstanceId = data.GameInstanceId;
    this.UserId = data.UserId;
    this.Value = data.Value;
    this.Comments = data.Comments;
  }
}
