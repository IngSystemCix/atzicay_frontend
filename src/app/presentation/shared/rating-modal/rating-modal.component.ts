import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingService } from '../../../core/infrastructure/service/rating.service';
import { RatingRequest } from '../../../core/domain/model/rating.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      *ngIf="isVisible" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);"
    >
      <!-- Modal Content -->
      <div 
        class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300"
        style="animation: modalSlideIn 0.3s ease-out;"
      >
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="text-6xl mb-3">🌟</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            ¡Valora tu experiencia!
          </h2>
          <p class="text-gray-600">
            Ayúdanos a mejorar calificando este juego
          </p>
        </div>

        <!-- Rating Stars -->
        <div class="mb-6">
          <p class="text-sm font-semibold text-gray-700 mb-3 text-center">
            ¿Qué tan divertido fue?
          </p>
          <div class="flex justify-center gap-2 mb-2">
            <button
              *ngFor="let star of [1, 2, 3, 4, 5]; let i = index"
              (click)="selectRating(star)"
              class="text-4xl transition-all duration-200 hover:scale-110 focus:outline-none"
              [class.text-yellow-400]="selectedRating >= star"
              [class.text-gray-300]="selectedRating < star"
              [attr.aria-label]="'Calificar con ' + star + ' estrella' + (star === 1 ? '' : 's')"
            >
              ⭐
            </button>
          </div>
          <div class="text-center">
            <span class="text-sm text-gray-500" *ngIf="selectedRating > 0">
              {{ getRatingText() }}
            </span>
          </div>
        </div>

        <!-- Comments -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Comentarios (opcional)
          </label>
          <textarea
            [(ngModel)]="comments"
            placeholder="¿Qué te gustó más del juego? ¿Algo que mejorarías?"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-0 resize-none text-sm"
            rows="3"
            maxlength="500"
          ></textarea>
          <div class="text-right text-xs text-gray-400 mt-1">
            {{ comments.length }}/500
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            (click)="closeModal()"
            class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
            [disabled]="isSubmitting"
          >
            Saltar
          </button>
          <button
            (click)="submitRating()"
            [disabled]="selectedRating === 0 || isSubmitting"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span *ngIf="!isSubmitting">Enviar ⭐</span>
            <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </span>
          </button>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `]
})
export class RatingModalComponent {
  @Input() isVisible = false;
  @Input() gameInstanceId = 0;
  @Output() close = new EventEmitter<void>();
  @Output() rated = new EventEmitter<void>();

  private ratingService = inject(RatingService);

  selectedRating = 0;
  comments = '';
  isSubmitting = false;
  errorMessage = '';

  selectRating(rating: number): void {
    this.selectedRating = rating;
    this.errorMessage = '';
  }

  getRatingText(): string {
    const texts = [
      '',
      '😢 No me gustó',
      '😐 Estuvo bien',
      '😊 Me gustó',
      '😄 ¡Me encantó!',
      '🤩 ¡Increíble!'
    ];
    return texts[this.selectedRating] || '';
  }

  async submitRating(): Promise<void> {
    if (this.selectedRating === 0 || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const ratingData: RatingRequest = {
      value: this.selectedRating,
      comments: this.comments.trim()
    };

    try {
      await firstValueFrom(this.ratingService.valueRating(this.gameInstanceId, ratingData));
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage();
      
      // Emitir evento de valoración exitosa
      this.rated.emit();
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        this.closeModal();
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar valoración:', error);
      this.errorMessage = 'Error al enviar la valoración. Por favor, inténtalo de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private showSuccessMessage(): void {
    // Mostrar mensaje de éxito temporal
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 z-[60] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300';
    successDiv.innerHTML = '✅ ¡Gracias por tu valoración!';
    document.body.appendChild(successDiv);

    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  closeModal(): void {
    this.isVisible = false;
    this.selectedRating = 0;
    this.comments = '';
    this.errorMessage = '';
    this.isSubmitting = false;
    this.close.emit();
  }
}
