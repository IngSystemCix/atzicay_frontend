export interface UpdateStatusRequest {
  status: boolean; // true = activo, false = inactivo
}

export interface UpdateStatusResponse {
  data?: any;
  message?: string;
  success: boolean;
}
