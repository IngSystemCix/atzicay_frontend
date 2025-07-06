export interface GameComment {
  comment: string;
  rating: string;
  user: string;
  programming_name: string;
}

export interface GameReportData {
  game_name: string;
  game_type: string;
  comments: GameComment[];
}

export interface GameReportResponse {
  success: boolean;
  code: number;
  message: string;
  data: GameReportData;
}
