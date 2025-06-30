import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private readonly defaultConfig = {
    confirmButtonColor: '#A293FA',
    timerProgressBar: true,
    showConfirmButton: false
  };

  /**
   * Muestra un mensaje de éxito con SweetAlert
   * @param message Mensaje a mostrar
   * @param title Título opcional (por defecto "¡Éxito!")
   * @param timer Tiempo en ms para auto-cerrar (por defecto 2500)
   */
  showSuccess(message: string, title: string = '¡Éxito!', timer: number = 2500): void {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      timer,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje de error con SweetAlert
   * @param message Mensaje a mostrar
   * @param title Título opcional (por defecto "Error")
   * @param timer Tiempo en ms para auto-cerrar (por defecto 3500)
   */
  showError(message: string, title: string = 'Error', timer: number = 3500): void {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      timer,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje de advertencia con SweetAlert
   * @param message Mensaje a mostrar
   * @param title Título opcional (por defecto "Advertencia")
   * @param timer Tiempo en ms para auto-cerrar (por defecto 3000)
   */
  showWarning(message: string, title: string = 'Advertencia', timer: number = 3000): void {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
      timer,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un mensaje informativo con SweetAlert
   * @param message Mensaje a mostrar
   * @param title Título opcional (por defecto "Información")
   * @param timer Tiempo en ms para auto-cerrar (por defecto 3000)
   */
  showInfo(message: string, title: string = 'Información', timer: number = 3000): void {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
      timer,
      ...this.defaultConfig
    });
  }

  /**
   * Muestra un diálogo de confirmación
   * @param message Mensaje a mostrar
   * @param title Título opcional (por defecto "¿Estás seguro?")
   * @returns Promise<boolean> true si confirma, false si cancela
   */
  async showConfirmation(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#A293FA',
      cancelButtonColor: '#d33'
    });
    return result.isConfirmed;
  }

  /**
   * Muestra un mensaje de éxito específico para creación de juegos
   * @param gameType Tipo de juego creado
   */
  showGameCreatedSuccess(gameType: string = 'Juego'): void {
    this.showSuccess(`${gameType} creado exitosamente!`);
  }

  /**
   * Muestra un mensaje de error específico para creación de juegos
   * @param error Error recibido del backend
   * @param gameType Tipo de juego que se intentaba crear
   */
  showGameCreationError(error: any, gameType: string = 'juego'): void {
    const errorMessage = error?.message || error?.error?.message || 'Error desconocido';
    this.showError(`Error al crear el ${gameType.toLowerCase()}: ${errorMessage}`);
  }
}
