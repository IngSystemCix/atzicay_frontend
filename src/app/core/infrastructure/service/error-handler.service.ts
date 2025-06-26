import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorsSubject = new BehaviorSubject<ErrorMessage[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  constructor() {}

  /**
   * Muestra un error en la aplicación
   */
  showError(message: string, type: 'error' | 'warning' | 'info' | 'success' = 'error', duration: number = 5000): void {
    const error: ErrorMessage = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      duration
    };

    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, error]);

    // Auto-remove después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        this.removeError(error.id);
      }, duration);
    }
  }

  /**
   * Remueve un error específico
   */
  removeError(errorId: string): void {
    const currentErrors = this.errorsSubject.value;
    const filteredErrors = currentErrors.filter(error => error.id !== errorId);
    this.errorsSubject.next(filteredErrors);
  }

  /**
   * Limpia todos los errores
   */
  clearAllErrors(): void {
    this.errorsSubject.next([]);
  }

  /**
   * Maneja errores HTTP
   */
  handleHttpError(error: any): void {
    let message = 'Ha ocurrido un error inesperado';
    
    if (error.error && error.error.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Mensajes específicos según el código de estado
    switch (error.status) {
      case 400:
        message = 'Solicitud incorrecta. Verifica los datos enviados.';
        break;
      case 401:
        message = 'No tienes autorización para realizar esta acción.';
        break;
      case 403:
        message = 'No tienes permisos para acceder a este recurso.';
        break;
      case 404:
        message = 'El recurso solicitado no fue encontrado.';
        break;
      case 422:
        message = 'Los datos proporcionados no son válidos.';
        break;
      case 500:
        message = 'Error interno del servidor. Intenta nuevamente más tarde.';
        break;
      case 503:
        message = 'Servicio no disponible temporalmente.';
        break;
    }

    this.showError(message, 'error');
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.showError(message, 'success', duration);
  }

  /**
   * Muestra mensaje de información
   */
  showInfo(message: string, duration: number = 4000): void {
    this.showError(message, 'info', duration);
  }

  /**
   * Muestra mensaje de advertencia
   */
  showWarning(message: string, duration: number = 4000): void {
    this.showError(message, 'warning', duration);
  }

  /**
   * Genera un ID único para los errores
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
