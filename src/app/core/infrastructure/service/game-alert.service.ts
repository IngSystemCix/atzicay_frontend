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
  matches?: number; // Para el juego de memoria
  currentWord?: string; // Para mostrar la palabra actual adivinada
  userAssessed?: boolean; // Para saber si el usuario ya valoró el juego
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
    const showRatingButton = !config.userAssessed;
    
    const alertConfig: any = {
      title: '¡Felicidades!',
      html: content,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '🎮 Jugar de nuevo',
      cancelButtonText: '🏠 Volver al Inicio',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      }
    };

    if (showRatingButton) {
      alertConfig.showDenyButton = true;
      alertConfig.denyButtonText = '⭐ Valorar juego';
      alertConfig.denyButtonColor = '#8b5cf6';
    }
    
    return Swal.fire(alertConfig);
  }

  /**
   * Modal de tiempo agotado
   */
  showTimeUpAlert(config: GameAlertConfig): Promise<any> {
    const content = this.getTimeUpContent(config);
    const showRatingButton = !config.userAssessed;
    
    const alertConfig: any = {
      title: '¡Tiempo agotado!',
      html: content,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '🔄 Intentar de nuevo',
      cancelButtonText: '🏠 Volver al Inicio',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
      allowOutsideClick: false,
      allowEscapeKey: false
    };

    if (showRatingButton) {
      alertConfig.showDenyButton = true;
      alertConfig.denyButtonText = '⭐ Valorar juego';
      alertConfig.denyButtonColor = '#8b5cf6';
    }
    
    return Swal.fire(alertConfig);
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
      cancelButtonText: '🏠 Volver al Inicio',
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
   * Modal cuando se completa una palabra específica (no todo el juego)
   */
  showWordCompletedAlert(config: GameAlertConfig): Promise<any> {
    const content = this.getWordCompletedContent(config);
    
    return Swal.fire({
      title: '¡Palabra adivinada!',
      html: content,
      icon: 'success',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      customClass: {
        popup: 'animated bounceIn',
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        // Agregar efecto de confeti o animación especial
        this.addConfettiEffect();
      }
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
      cancelButtonText: '🏠 Volver al Inicio',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'animated bounceIn',
      },
      allowOutsideClick: false,
      allowEscapeKey: false
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
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: #10b981; font-weight: bold;">
              ¡Has completado el rompecabezas!
            </p>
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 1.5rem; border-radius: 1rem; margin: 1rem 0; border: 2px solid #bbf7d0;">
              ${config.timeUsed ? 
                `<p style="font-size: 1rem; color: #166534; margin-bottom: 0.5rem;">
                  ⏱️ Tiempo de resolución: <strong>${config.timeUsed}</strong>
                </p>` : ''}
              <p style="font-size: 0.9rem; color: #15803d; margin-top: 0.5rem;">
                ¡Excelente trabajo resolviendo el puzzle! 🧩✨
              </p>
            </div>
          </div>
        `;
      
      case 'memory':
        return this.getMemorySuccessContent(config);
      
      case 'solve-the-word':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem; color: #10b981; font-weight: bold;">
              ¡Has encontrado todas las palabras!
            </p>
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 1.5rem; border-radius: 1rem; margin: 1rem 0; border: 2px solid #bbf7d0;">
              ${config.timeUsed ? 
                `<p style="font-size: 1rem; color: #166534; margin-bottom: 0.5rem;">
                  ⏱️ Tiempo usado: <strong>${config.timeUsed}</strong>
                </p>` : ''}
              ${config.wordsCompleted && config.totalWords ? 
                `<p style="font-size: 1rem; color: #166534; margin-bottom: 0.5rem;">
                  🎯 Palabras encontradas: <strong>${config.wordsCompleted}/${config.totalWords}</strong>
                </p>` : ''}
              <p style="font-size: 0.9rem; color: #15803d; margin-top: 0.5rem;">
                ¡Excelente trabajo! 🎉
              </p>
            </div>
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
              El tiempo se agotó antes de encontrar todas las palabras.
            </p>
            ${config.wordsCompleted && config.totalWords ? 
              `<div style="background: #f3f4f6; padding: 1rem; border-radius: 1rem; margin: 1rem 0;">
                <p style="font-size: 1rem; color: #374151; margin-bottom: 0.5rem;">Progreso alcanzado:</p>
                <p style="font-size: 1.4rem; font-weight: bold; color: ${config.wordsCompleted === config.totalWords ? '#10b981' : '#f59e0b'};">
                  ${config.wordsCompleted} de ${config.totalWords} palabras encontradas
                </p>
                <div style="width: 100%; background: #e5e7eb; border-radius: 1rem; height: 8px; margin-top: 0.5rem;">
                  <div style="width: ${Math.round((config.wordsCompleted / config.totalWords) * 100)}%; background: ${config.wordsCompleted === config.totalWords ? '#10b981' : '#f59e0b'}; height: 100%; border-radius: 1rem;"></div>
                </div>
              </div>` : ''}
            <p style="font-size: 0.9rem; color: #6b7280; margin-top: 1rem;">
              ¡No te desanimes! Puedes intentarlo de nuevo o valorar tu experiencia.
            </p>
          </div>
        `;
      
      case 'puzzle':
        return `
          <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
            <p style="font-size: 1.2rem; margin-bottom: 1rem;">
              El tiempo se agotó antes de completar el rompecabezas.
            </p>
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 1rem; margin: 1rem 0;">
              <p style="font-size: 1rem; color: #374151; margin-bottom: 0.5rem;">Estado del rompecabezas:</p>
              <p style="font-size: 1.1rem; font-weight: bold; color: #f59e0b;">
                🧩 Puzzle incompleto
              </p>
              <p style="font-size: 0.9rem; color: #6b7280; margin-top: 0.5rem;">
                ¡Estabas tan cerca! Inténtalo de nuevo.
              </p>
            </div>
            <p style="font-size: 0.9rem; color: #6b7280; margin-top: 1rem;">
              ¡No te desanimes! Puedes intentarlo de nuevo o valorar tu experiencia.
            </p>
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

  private getWordCompletedContent(config: GameAlertConfig): string {
    const gameIcon = this.getGameIcon(config.gameType);
    
    return `
      <div style="text-align: center;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">${gameIcon}</div>
        <p style="font-size: 1.3rem; margin-bottom: 1rem; font-weight: bold; color: #10b981;">
          ¡Excelente!
        </p>
        ${config.currentWord ? 
          `<div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 1rem; border-radius: 1rem; margin: 1rem 0; border: 2px solid #bbf7d0;">
            <p style="font-size: 1.1rem; color: #166534; margin-bottom: 0.5rem;">Palabra adivinada:</p>
            <p style="font-size: 1.4rem; font-weight: bold; color: #15803d; letter-spacing: 2px;">${config.currentWord}</p>
          </div>` : ''}
        ${config.wordsCompleted && config.totalWords ? 
          `<p style="font-size: 1rem; color: #6b7280; margin-bottom: 1rem;">
            Progreso: <strong>${config.wordsCompleted}/${config.totalWords}</strong> palabras completadas
          </p>` : ''}
        <div style="background: #eff6ff; padding: 1rem; border-radius: 1rem; border: 2px solid #bfdbfe;">
          <p style="font-size: 0.95rem; color: #1e40af; font-weight: 500;">
            Continuando automáticamente en <span id="countdown-timer">5</span> segundos...
          </p>
        </div>
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

  private addConfettiEffect(): void {
    // Crear efecto de confeti simple usando CSS y JavaScript nativo
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(confettiContainer);

    // Crear partículas de confeti
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    
    for (let i = 0; i < 50; i++) {
      const confettiPiece = document.createElement('div');
      confettiPiece.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;
      confettiContainer.appendChild(confettiPiece);
    }

    // Agregar keyframes CSS si no existen
    if (!document.querySelector('#confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Limpiar después de la animación
    setTimeout(() => {
      if (confettiContainer && confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    }, 6000);

    // Agregar contador regresivo
    this.startCountdown();
  }

  private startCountdown(): void {
    let timeLeft = 5;
    const countdownElement = document.getElementById('countdown-timer');
    
    if (countdownElement) {
      const interval = setInterval(() => {
        timeLeft--;
        if (countdownElement) {
          countdownElement.textContent = timeLeft.toString();
        }
        
        if (timeLeft <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
  }

  /**
   * Contenido para completar juego de memoria
   */
  private getMemorySuccessContent(config: GameAlertConfig): string {
    return `
      <div class="text-center space-y-4">
        <div class="text-4xl mb-4">🧠✨</div>
        <div class="text-lg font-semibold text-gray-800">
          ¡Increíble memoria! Has encontrado todas las parejas
        </div>
        <div class="bg-blue-50 rounded-lg p-4 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">⏱️ Tiempo:</span>
            <span class="font-bold text-blue-600">${config.timeUsed}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">🔄 Intentos realizados:</span>
            <span class="font-bold text-green-600">${config.attempts || 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">🎯 Parejas encontradas:</span>
            <span class="font-bold text-purple-600">${config.matches || 0}</span>
          </div>
        </div>
        <div class="text-sm text-gray-600">
          ¡Tu memoria y concentración son excepcionales! 🌟
        </div>
      </div>
    `;
  }
}
