import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export interface GameAlertConfig {
  gameType: 'hangman' | 'puzzle' | 'memory' | 'solve-the-word';
  gameName?: string;
  timeUsed?: string;
  wordsCompleted?: number;
  totalWords?: number;
  score?: number;
  lives?: number;
  attempts?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameAlertService {

  /**
   * Modal de éxito cuando se completa el juego
   */
  showSuccessAlert(config: GameAlertConfig): Promise<any> {
    const content = this.getSuccessContent(config);
    
    return Swal.fire({
      title: '¡Felicidades!',
      html: content,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '🎮 Jugar de nuevo',
      cancelButtonText: 'Continuar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
      backdrop: `
        rgba(0,0,123,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
      `
    });
  }

  /**
   * Modal de tiempo agotado
   */
  showTimeUpAlert(config: GameAlertConfig): Promise<any> {
    const content = this.getTimeUpContent(config);
    
    return Swal.fire({
      title: '¡Tiempo agotado!',
      html: content,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🔄 Intentar de nuevo',
      cancelButtonText: 'Ver resultados',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
    });
  }

  /**
   * Modal cuando pierde una vida pero aún tiene vidas
   */
  showLifeLostAlert(config: GameAlertConfig): Promise<any> {
    const content = this.getLifeLostContent(config);
    
    return Swal.fire({
      title: '¡Ups! Perdiste una vida',
      html: content,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '💪 Continuar',
      cancelButtonText: 'Rendirse',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
      timer: 5000,
      timerProgressBar: true,
    });
  }

  /**
   * Modal cuando se acaban todas las vidas
   */
  showGameOverAlert(config: GameAlertConfig): Promise<any> {
    const content = this.getGameOverContent(config);
    
    return Swal.fire({
      title: '¡Juego Terminado!',
      html: content,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: '🔄 Jugar de nuevo',
      cancelButtonText: 'Salir',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
    });
  }

  /**
   * Modal de valoración del juego
   */
  showRatingAlert(config: GameAlertConfig): Promise<any> {
    const gameIcon = this.getGameIcon(config.gameType);
    
    return Swal.fire({
      title: '¡Ayúdanos a mejorar!',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
          <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
            ¿Qué te pareció <strong>${config.gameName || 'este juego'}</strong>?
          </p>
          <div style="margin: 1.5rem 0;">
            <p style="margin-bottom: 1rem; color: #6b7280;">Califica tu experiencia:</p>
            <div style="display: flex; justify-content: center; gap: 10px;">
              ${[1, 2, 3, 4, 5].map(rating => 
                `<button type="button" 
                         class="rating-star" 
                         data-rating="${rating}"
                         style="background: none; border: none; font-size: 2rem; cursor: pointer; color: #d1d5db; transition: color 0.2s;"
                         onmouseover="this.style.color='#fbbf24'"
                         onmouseout="this.style.color='#d1d5db'"
                         onclick="selectRating(${rating})">⭐</button>`
              ).join('')}
            </div>
          </div>
          <textarea 
            id="rating-comment" 
            placeholder="Comparte tu opinión (opcional)..."
            style="width: 100%; height: 80px; margin-top: 1rem; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;"
          ></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '📝 Enviar Valoración',
      cancelButtonText: 'Omitir',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
      didOpen: () => {
        // Agregar funcionalidad de rating interactivo
        this.setupRatingInteraction();
      },
      preConfirm: () => {
        const selectedRating = (window as any).selectedRating || 0;
        const comment = (document.getElementById('rating-comment') as HTMLTextAreaElement)?.value || '';
        
        if (selectedRating === 0) {
          Swal.showValidationMessage('Por favor selecciona una calificación');
          return false;
        }
        
        return { rating: selectedRating, comment };
      }
    });
  }

  /**
   * Modal de error genérico
   */
  showErrorAlert(message: string, details?: string): Promise<any> {
    return Swal.fire({
      title: 'Error',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">${message}</p>
          ${details ? `<p style="font-size: 0.9rem; color: #6b7280;">${details}</p>` : ''}
        </div>
      `,
      icon: 'error',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#ef4444',
      customClass: {
        popup: 'animated bounceIn',
      },
    });
  }

  private getSuccessContent(config: GameAlertConfig): string {
    const gameIcon = this.getGameIcon(config.gameType);
    
    switch (config.gameType) {
      case 'hangman':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              ¡Has adivinado todas las palabras!
            </p>
            ${config.wordsCompleted && config.totalWords ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Palabras completadas: <strong>${config.wordsCompleted}/${config.totalWords}</strong>
              </p>` : ''}
            ${config.timeUsed ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Tiempo usado: <strong>${config.timeUsed}</strong>
              </p>` : ''}
          </div>
        `;
      
      case 'puzzle':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              ¡Has completado el rompecabezas!
            </p>
            ${config.timeUsed ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Tiempo de resolución: <strong>${config.timeUsed}</strong>
              </p>` : ''}
          </div>
        `;
      
      case 'memory':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              ¡Has encontrado todas las parejas!
            </p>
            ${config.timeUsed ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Tiempo total: <strong>${config.timeUsed}</strong>
              </p>` : ''}
            ${config.attempts ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Intentos realizados: <strong>${config.attempts}</strong>
              </p>` : ''}
          </div>
        `;
      
      case 'solve-the-word':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              ¡Has encontrado todas las palabras!
            </p>
            ${config.timeUsed ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Tiempo usado: <strong>${config.timeUsed}</strong>
              </p>` : ''}
            ${config.wordsCompleted && config.totalWords ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Palabras encontradas: <strong>${config.wordsCompleted}/${config.totalWords}</strong>
              </p>` : ''}
          </div>
        `;
      
      default:
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              ¡Felicidades! Has completado el juego.
            </p>
          </div>
        `;
    }
  }

  private getTimeUpContent(config: GameAlertConfig): string {
    const gameIcon = this.getGameIcon(config.gameType);
    
    switch (config.gameType) {
      case 'hangman':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              Se acabó el tiempo para adivinar las palabras.
            </p>
            ${config.wordsCompleted && config.totalWords ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Palabras adivinadas: <strong>${config.wordsCompleted}/${config.totalWords}</strong>
              </p>` : ''}
          </div>
        `;
      
      case 'solve-the-word':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              Se acabó el tiempo para encontrar las palabras.
            </p>
            ${config.wordsCompleted && config.totalWords ? 
              `<p style="font-size: 1rem; color: #6b7280;">
                Palabras encontradas: <strong>${config.wordsCompleted}/${config.totalWords}</strong>
              </p>` : ''}
          </div>
        `;
      
      default:
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              ¡Se acabó el tiempo!
            </p>
          </div>
        `;
    }
  }

  private getLifeLostContent(config: GameAlertConfig): string {
    return `
      <div style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">💔</div>
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">
          ${config.gameType === 'hangman' ? 'Letra incorrecta' : 'Movimiento incorrecto'}
        </p>
        ${config.lives ? 
          `<p style="font-size: 1rem; color: #6b7280;">
            Te quedan <strong>${config.lives} vidas</strong>
          </p>` : ''}
        <p style="font-size: 0.9rem; color: #f59e0b; margin-top: 1rem;">
          ¡No te rindas, sigue intentando!
        </p>
      </div>
    `;
  }

  private getGameOverContent(config: GameAlertConfig): string {
    const gameIcon = this.getGameIcon(config.gameType);
    
    return `
      <div style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">💀</div>
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">
          ${config.gameType === 'hangman' ? 'Se acabaron las vidas. El ahorcado ha perdido.' : 'Se acabaron las oportunidades.'}
        </p>
        ${config.wordsCompleted && config.totalWords ? 
          `<p style="font-size: 1rem; color: #6b7280;">
            Progreso alcanzado: <strong>${config.wordsCompleted}/${config.totalWords}</strong>
          </p>` : ''}
        <p style="font-size: 0.9rem; color: #6b7280; margin-top: 1rem;">
          ¡Inténtalo de nuevo para mejorar tu puntuación!
        </p>
      </div>
    `;
  }

  private getGameIcon(gameType: string): string {
    switch (gameType) {
      case 'hangman': return '🎯';
      case 'puzzle': return '🧩';
      case 'memory': return '🃏';
      case 'solve-the-word': return '📝';
      default: return '🎮';
    }
  }

  private setupRatingInteraction(): void {
    // Configurar interacción de rating
    (window as any).selectedRating = 0;
    (window as any).selectRating = (rating: number) => {
      (window as any).selectedRating = rating;
      const stars = document.querySelectorAll('.rating-star');
      stars.forEach((star, index) => {
        const element = star as HTMLElement;
        if (index < rating) {
          element.style.color = '#fbbf24';
        } else {
          element.style.color = '#d1d5db';
        }
      });
    };

    // Agregar hover effects
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => {
          const element = s as HTMLElement;
          if (i <= index) {
            element.style.color = '#fbbf24';
          } else {
            element.style.color = '#d1d5db';
          }
        });
      });

      star.addEventListener('mouseleave', () => {
        const selectedRating = (window as any).selectedRating || 0;
        stars.forEach((s, i) => {
          const element = s as HTMLElement;
          if (i < selectedRating) {
            element.style.color = '#fbbf24';
          } else {
            element.style.color = '#d1d5db';
          }
        });
      });
    });
  }
}
