export interface ProgrammingStatusRequest {
  status: number; // 1 = público, 0 = restringido
}

export interface ProgrammingStatusResponse {
  data?: any;
  message?: string;
  success: boolean;
}
