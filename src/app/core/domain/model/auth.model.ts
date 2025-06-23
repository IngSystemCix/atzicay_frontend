export interface User {
  Id: number;
  Email: string;
  Name: string;
  LastName: string;
  Gender: string;
  CountryId: number;
  City: string;
  Birthdate: string;
  CreatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Auth {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}