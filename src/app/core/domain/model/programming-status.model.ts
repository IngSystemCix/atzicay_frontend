export interface ProgrammingStatusRequest {
  status: number; // 1 = público, 0 = restringido
}

export interface ProgrammingStatusResponse {
  data?: {
    status: number;
    isActive: boolean;
  } | null;
  message?: string;
  success: boolean;
  code?: number;
}
