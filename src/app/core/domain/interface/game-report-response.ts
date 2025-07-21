export interface GamePlayer {
  UserId: number;
  Name: string;
  LastName: string;
  Email: string;
  Duration: number;
  Won: boolean;
  DateGame: string;
}

export interface GameReportData {
  game_name: string;
  total_players: number;
  players: GamePlayer[];
}

export interface GameReportResponse {
  success?: boolean;
  code?: number;
  message?: string;
  data: GameReportData;
}
