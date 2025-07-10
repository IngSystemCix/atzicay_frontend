export interface MyGame {
  name: string;
  difficulty: string;
  visibility: string; // 'P' = público, 'R' = restringido
  activated: number; // 0 = desactivado, 1 = activado
  author: string;
  type_game: string;
  rating: string;
  game_instance_id: number;
  author_id: number;
}

export interface MyGamesResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    total: number;
    data: MyGame[];
  };
}
