export interface GameReport {
  users: number;
  sessions: number;
  month: string;
}

export interface GameReportResponse {
  data: GameReport[];
}
