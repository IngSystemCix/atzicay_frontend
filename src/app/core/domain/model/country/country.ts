export class Country {
  Id:number;
  Name:string;

  constructor(data: any) {
    this.Id = data.Id;
    this.Name = data.Name;
  }
}
