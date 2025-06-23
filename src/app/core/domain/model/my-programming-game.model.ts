export interface MyProgrammingGame {
  game_instance_id: number;
  programming_name: string;
  type_game: string;
  name_game: string;
  start_time: string;
  end_time: string;
  attempts: number;
  maximum_time: number;
  status: number;
}

export interface MyProgrammingGamesResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    total: number;
    data: MyProgrammingGame[];
  };
}
