import { Injectable, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { RatingService, RatingRequest } from './rating.service';
import { GameAudioService } from './game-audio.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingModalService {
  private ratingService = inject(RatingService);
  private audioService = inject(GameAudioService);

  /**
   * Muestra el modal de valoración con SweetAlert
   * @param gameInstanceId ID de la instancia del juego
   * @param userId ID del usuario
   * @param gameName Nombre del juego para mostrar en el modal
   * @param context Contexto del juego: 'completed' | 'timeup' | 'general'
   * @returns Promise<boolean> - true si se envió la valoración, false si se canceló
   */
  async showRatingModal(gameInstanceId: number, userId: number, gameName: string = 'juego', context: 'completed' | 'timeup' | 'general' = 'general'): Promise<boolean> {
    
    this.audioService.playButtonClick();
    
    let selectedRating = 0;
    
    // Definir el mensaje según el contexto
    let titleMessage = '';
    let descriptionMessage = '';
    
    switch (context) {
      case 'completed':
        titleMessage = `¡Has completado el juego ${gameName}!`;
        descriptionMessage = '¿Qué te pareció esta experiencia?';
        break;
      case 'timeup':
        titleMessage = `¡Valora tu experiencia con ${gameName}!`;
        descriptionMessage = 'Aunque se acabó el tiempo, ¿qué te pareció el juego?';
        break;
      default:
        titleMessage = `¡Valora tu experiencia con ${gameName}!`;
        descriptionMessage = '¿Qué te pareció esta experiencia?';
        break;
    }
    
    const { value: result } = await Swal.fire({
      title: titleMessage,
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <p style="margin-bottom: 16px; color: #6b7280; font-size: 16px;">${descriptionMessage}</p>
          
          <div style="padding: 16px 0; margin-bottom: 24px;" id="stars-container">
            <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 8px;">
              <button type="button" data-rating="1" style="background: none; border: none; cursor: pointer; font-size: 48px; transition: all 0.2s ease; outline: none; user-select: none;">
                <span style="color: #d1d5db; transition: all 0.2s ease;">★</span>
              </button>
              <button type="button" data-rating="2" style="background: none; border: none; cursor: pointer; font-size: 48px; transition: all 0.2s ease; outline: none; user-select: none;">
                <span style="color: #d1d5db; transition: all 0.2s ease;">★</span>
              </button>
              <button type="button" data-rating="3" style="background: none; border: none; cursor: pointer; font-size: 48px; transition: all 0.2s ease; outline: none; user-select: none;">
                <span style="color: #d1d5db; transition: all 0.2s ease;">★</span>
              </button>
              <button type="button" data-rating="4" style="background: none; border: none; cursor: pointer; font-size: 48px; transition: all 0.2s ease; outline: none; user-select: none;">
                <span style="color: #d1d5db; transition: all 0.2s ease;">★</span>
              </button>
              <button type="button" data-rating="5" style="background: none; border: none; cursor: pointer; font-size: 48px; transition: all 0.2s ease; outline: none; user-select: none;">
                <span style="color: #d1d5db; transition: all 0.2s ease;">★</span>
              </button>
            </div>
            <p style="margin-top: 8px; font-size: 14px; color: #6b7280; font-weight: normal;" id="rating-text">Selecciona tu valoración</p>
          </div>
          
          <div style="text-align: left;">
            <label for="swal-textarea" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">
              Comentarios (opcional)
            </label>
            <textarea 
              id="swal-textarea" 
              style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; resize: none; font-family: inherit; font-size: 14px; line-height: 1.5; box-sizing: border-box;"
              rows="4" 
              placeholder="Comparte tu experiencia o sugerencias..."
              maxlength="500"
            ></textarea>
            <div style="text-align: right; font-size: 12px; color: #9ca3af; margin-top: 4px;" id="char-count">0/500</div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Enviar Valoración',
      cancelButtonText: 'Ahora no',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      preConfirm: async () => {
        const textarea = document.getElementById('swal-textarea') as HTMLTextAreaElement;
        const comments = textarea?.value || '';
        
        if (selectedRating === 0) {
          Swal.showValidationMessage('Por favor selecciona una valoración');
          return false;
        }
        
        try {
          const rating: RatingRequest = {
            value: selectedRating,
            comments: comments.trim()
          };
          
          await firstValueFrom(this.ratingService.rateGame(gameInstanceId, userId, rating));
          return { rating: selectedRating, comments };
        } catch (error) {
          console.error('Error al enviar valoración:', error);
          Swal.showValidationMessage('Error al enviar la valoración. Inténtalo de nuevo.');
          return false;
        }
      },
      didOpen: () => {
        this.setupModalInteractions(() => selectedRating, (rating) => selectedRating = rating);
      },
      width: '500px',
      padding: '2rem',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.7)'
    });

    if (result) {
      await Swal.fire({
        icon: 'success',
        title: '¡Gracias por tu valoración!',
        text: 'Tu opinión nos ayuda a mejorar la experiencia de juego.',
        confirmButtonText: 'Continuar',
        timer: 3000,
        timerProgressBar: true
      });
      
      this.audioService.playCorrectMove();
      return true;
    }
    
    return false;
  }

  /**
   * Configura las interacciones del modal (estrellas, contador de caracteres)
   */
  private setupModalInteractions(getRating: () => number, setRating: (rating: number) => void): void {
    // Configurar interacción con estrellas
    const starBtns = document.querySelectorAll('button[data-rating]');
    const ratingText = document.getElementById('rating-text');
    
    const ratingTexts = [
      'Selecciona tu valoración',
      '⭐ Muy malo',
      '⭐⭐ Malo', 
      '⭐⭐⭐ Regular',
      '⭐⭐⭐⭐ Bueno',
      '⭐⭐⭐⭐⭐ ¡Excelente!'
    ];

    starBtns.forEach((btn, index) => {
      const starIcon = btn.querySelector('span') as HTMLElement;
      
      btn.addEventListener('mouseenter', () => {
        this.updateStars(starBtns, index + 1, true);
        if (ratingText) {
          ratingText.textContent = ratingTexts[index + 1];
          ratingText.style.color = '#d97706'; // yellow-600
          ratingText.style.fontWeight = '500';
        }
      });

      btn.addEventListener('mouseleave', () => {
        this.updateStars(starBtns, getRating(), false);
        if (ratingText) {
          ratingText.textContent = getRating() > 0 ? ratingTexts[getRating()] : ratingTexts[0];
          if (getRating() > 0) {
            ratingText.style.color = '#d97706'; // yellow-600
            ratingText.style.fontWeight = '500';
          } else {
            ratingText.style.color = '#6b7280'; // gray-500
            ratingText.style.fontWeight = 'normal';
          }
        }
      });

      btn.addEventListener('click', () => {
        this.audioService.playButtonClick();
        setRating(index + 1);
        this.updateStars(starBtns, index + 1, false);
        if (ratingText) {
          ratingText.textContent = ratingTexts[index + 1];
          ratingText.style.color = '#d97706'; // yellow-600
          ratingText.style.fontWeight = '500';
        }
      });
    });

    // Configurar contador de caracteres
    const textarea = document.getElementById('swal-textarea') as HTMLTextAreaElement;
    const charCount = document.getElementById('char-count');
    
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        charCount.textContent = `${length}/500`;
        
        if (length > 450) {
          charCount.style.color = '#ef4444'; // red-500
        } else if (length > 350) {
          charCount.style.color = '#eab308'; // yellow-500
        } else {
          charCount.style.color = '#9ca3af'; // gray-400
        }
      });
    }
  }

  /**
   * Actualiza la visualización de las estrellas
   */
  private updateStars(starBtns: NodeListOf<Element>, rating: number, isHover: boolean): void {
    starBtns.forEach((btn, index) => {
      const starIcon = btn.querySelector('span') as HTMLElement;
      if (index < rating) {
        starIcon.style.color = isHover ? '#fbbf24' : '#f59e0b'; // yellow-400 : yellow-500
        (btn as HTMLElement).style.transform = isHover ? 'scale(1.1)' : 'scale(1)';
      } else {
        starIcon.style.color = '#d1d5db'; // gray-300
        (btn as HTMLElement).style.transform = 'scale(1)';
      }
    });
  }
}
