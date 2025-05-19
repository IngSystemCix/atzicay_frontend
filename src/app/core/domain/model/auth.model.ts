export interface Auth {
  access_token: string;
  user: {
    Name: string;
    Email: string;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    Name: string;
    Email: string;
  }
}
