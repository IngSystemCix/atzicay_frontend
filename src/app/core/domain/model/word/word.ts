export class Word {
  Id: number;
  SolveTheWordId: number;
  Word: string;
  Orientation: 'HL'|'HR'|'VU'|'VD'|'DU'|'DD';

  constructor(data: any) {
    this.Id = data.Id;
    this.SolveTheWordId = data.SolveTheWordId;
    this.Word = data.Word;
    this.Orientation = data.Orientation;
  }
}
