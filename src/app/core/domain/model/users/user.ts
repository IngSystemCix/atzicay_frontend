export class User {
  Id:number;
  Activated:Boolean;
  GoogleId:number;
  Email:string;
  Name:String;
  LastName:string;
  Gender: 'M' | 'F' |'O';
  CountryId:number;
  City:string;
  Birthdate:string;
  CreatedAt:string;

    constructor(data: any) {
        this.Id = data.Id;
        this.Activated = data.Activated;
        this.GoogleId = data.GoogleId;
        this.Email = data.Email;
        this.Name = data.Name;
        this.LastName = data.LastName;
        this.Gender = data.Gender;
        this.CountryId = data.CountryId;
        this.City = data.City;
        this.Birthdate = data.Birthdate;
        this.CreatedAt = data.CreatedAt;
    }

}
