export interface Rating {
  id?: number;
  gameInstanceId: number;
  userId: number;
  value: number; 
  comments: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingRequest {
  value: number;
  comments: string;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  data?: Rating;
}
