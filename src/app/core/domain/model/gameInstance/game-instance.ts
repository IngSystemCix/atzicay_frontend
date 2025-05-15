export class GameInstance {
  Id:number;
  Name:string;
  Description:string;
  ProfessorId:number;
  Activated:boolean;
  Difficulty:'E'|'M'|'D';
  Visibility:"P"|"R";//Daniel, Private (R) or public (P)

  constructor(data: any) {
    this.Id = data.Id;
    this.Name = data.Name;
    this.Description = data.Description;
    this.ProfessorId = data.ProfessorId;
    this.Activated = data.Activated;
    this.Difficulty = data.Difficulty;
    this.Visibility = data.Visibility;
  }
}
