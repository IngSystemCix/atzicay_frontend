export class MemoryGame {
  Id: number;
  GameInstanceId: number;
  Mode: 'II'|'ID';
  PathImg1: string;
  PathImg2: string | null;
  DescriptionImg: string | null;

  constructor(data: any) {
    this.Id = data.Id;
    this.GameInstanceId = data.GameInstanceId;
    this.Mode = data.Mode;
    this.PathImg1 = data.PathImg1;
    this.PathImg2 = data.PathImg2;
    this.DescriptionImg = data.DescriptionImg;
  }
}
