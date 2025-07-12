import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { MyGame } from '../../../../core/domain/model/my-game.model';
import { GameConfiguration } from '../../../../core/domain/model/game-configuration.model';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameEditService, GameEditRequest } from '../../../../core/infrastructure/api/game-edit.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { HangmanFormComponent } from './forms/hangman-form.component';
import { MemoryFormComponent } from './forms/memory-form.component';
import { PuzzleFormComponent } from './forms/puzzle-form.component';
import { SolveWordFormComponent } from './forms/solve-word-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-game-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HangmanFormComponent, MemoryFormComponent, PuzzleFormComponent, SolveWordFormComponent],
  template: `
    <div class="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-800">
              Editar {{ getGameTypeName(gameData?.type_game) }}
            </h2>
            <button 
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          @if (loading) {
            <div class="flex items-center justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8571FB]"></div>
            </div>
          } @else if (error) {
            <div class="text-center py-12">
              <div class="text-red-500 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <p class="text-gray-600 mb-4">{{ error }}</p>
              <button 
                (click)="loadGameData()"
                class="px-4 py-2 bg-[#8571FB] text-white rounded-lg hover:bg-[#7161EB] transition-colors">
                Reintentar
              </button>
            </div>
          } @else if (gameConfig) {
            <!-- Formulario común -->
            <div class="mb-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del juego</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editForm.Name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent"
                    placeholder="Ingrese el nombre del juego">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Dificultad</label>
                  <select 
                    [(ngModel)]="editForm.Difficulty"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
                    <option value="E">Fácil</option>
                    <option value="M">Medio</option>
                    <option value="H">Difícil</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea 
                  [(ngModel)]="editForm.Description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent"
                  placeholder="Ingrese la descripción del juego"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Visibilidad</label>
                  <select 
                    [(ngModel)]="editForm.Visibility"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
                    <option value="P">Público</option>
                    <option value="R">Restringido</option>
                  </select>
                </div>
                <div class="flex items-center">
                  <label class="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="editForm.Activated"
                      class="sr-only">
                    <div class="relative">
                      <div class="w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-300"
                           [class.bg-[#8571FB]]="editForm.Activated"></div>
                      <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform duration-300"
                           [class.transform]="editForm.Activated"
                           [class.translate-x-4]="editForm.Activated"></div>
                    </div>
                    <span class="ml-3 text-sm font-medium text-gray-700">Activado</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Formulario específico por tipo de juego -->
            @switch (gameData?.type_game) {
              @case ('hangman') {
                <app-hangman-form 
                  [gameConfig]="gameConfiguration"
                  (dataChange)="onGameSpecificDataChange($event)">
                </app-hangman-form>
              }
              @case ('memory') {
                <app-memory-form 
                  [gameConfig]="gameConfiguration"
                  (dataChange)="onGameSpecificDataChange($event)">
                </app-memory-form>
              }
              @case ('puzzle') {
                <app-puzzle-form 
                  [gameConfig]="gameConfiguration"
                  (dataChange)="onGameSpecificDataChange($event)">
                </app-puzzle-form>
              }
              @case ('solve_the_word') {
                <app-solve-word-form 
                  [gameConfig]="gameConfiguration"
                  (dataChange)="onGameSpecificDataChange($event)">
                </app-solve-word-form>
              }
            }
          }
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div class="flex justify-end space-x-3">
            <button 
              (click)="closeModal()"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button 
              (click)="saveGame()"
              [disabled]="saving"
              class="px-6 py-2 bg-[#8571FB] text-white rounded-lg hover:bg-[#7161EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              @if (saving) {
                <div class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              } @else {
                Guardar Cambios
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditGameModalComponent implements OnInit, OnDestroy {
  @Input() gameData: MyGame | null = null;
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSaved = new EventEmitter<void>();

  private gameConfigService = inject(GameConfigurationService);
  private gameEditService = inject(GameEditService);
  private userSessionService = inject(UserSessionService);
  private subscription = new Subscription();

  loading = false;
  saving = false;
  error: string | null = null;
  gameConfig: GameConfiguration | null = null;
  gameConfiguration: GameConfiguration | null = null;
  gameSpecificData: any = {};
  
  editForm: any = {
    Name: '',
    Description: '',
    Difficulty: 'E',
    Visibility: 'P',
    Activated: true,
    // Campos específicos de hangman
    Word: '',
    Clue: '',
    Presentation: 'A'
  };

  ngOnInit() {
    if (this.gameData && this.isVisible) {
      this.loadGameData();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadGameData() {
    if (!this.gameData) return;

    this.loading = true;
    this.error = null;

    const userId = this.userSessionService.getUserId();
    
    this.subscription.add(
      this.gameConfigService.getGameConfiguration(this.gameData.game_instance_id, userId || undefined, false)
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              this.gameConfig = response.data;
              this.populateForm();
            } else {
              this.error = 'No se pudo cargar la configuración del juego';
            }
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading game config:', err);
            this.error = 'Error al cargar los datos del juego';
            this.loading = false;
          }
        })
    );
  }

  private populateForm() {
    if (!this.gameConfig) return;

    // Datos comunes
    this.editForm.Name = this.gameConfig.game_name;
    this.editForm.Description = this.gameConfig.game_description;
    this.editForm.Difficulty = this.gameConfig.difficulty;
    this.editForm.Visibility = this.gameConfig.visibility;
    this.editForm.Activated = this.gameConfig.activated;

    // Asignar la configuración para los formularios especializados
    this.gameConfiguration = this.gameConfig;

    // Datos específicos según el tipo de juego
    switch (this.gameData?.type_game) {
      case 'hangman':
        if (this.gameConfig.hangman_words && this.gameConfig.hangman_words.length > 0) {
          const firstWord = this.gameConfig.hangman_words[0];
          this.editForm.Word = firstWord.word;
          this.editForm.Clue = firstWord.clue;
          this.editForm.Presentation = firstWord.presentation;
        }
        break;
      // Otros casos se implementarán después
    }
  }

  onGameSpecificDataChange(data: any) {
    this.gameSpecificData = data;
  }

  saveGame() {
    if (!this.gameData || !this.gameConfig) return;

    this.saving = true;

    const gameEditRequest: GameEditRequest = {
      gameType: this.gameData.type_game as any,
      data: this.buildGameData()
    };

    this.subscription.add(
      this.gameEditService.updateGame(this.gameData.game_instance_id, gameEditRequest)
        .subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                title: '¡Éxito!',
                text: 'El juego se ha actualizado correctamente',
                icon: 'success',
                confirmButtonColor: '#8571FB'
              });
              this.onSaved.emit();
              this.closeModal();
            } else {
              Swal.fire({
                title: 'Error',
                text: response.message || 'No se pudo actualizar el juego',
                icon: 'error',
                confirmButtonColor: '#8571FB'
              });
            }
            this.saving = false;
          },
          error: (err) => {
            console.error('Error saving game:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al guardar los cambios',
              icon: 'error',
              confirmButtonColor: '#8571FB'
            });
            this.saving = false;
          }
        })
    );
  }

  private buildGameData() {
    const baseData = {
      Name: this.editForm.Name,
      Description: this.editForm.Description,
      Difficulty: this.editForm.Difficulty,
      Visibility: this.editForm.Visibility,
      Activated: this.editForm.Activated
    };

    // Agregar datos específicos según el tipo de juego
    switch (this.gameData?.type_game) {
      case 'hangman':
        return {
          ...baseData,
          Word: this.gameSpecificData?.Word || '',
          Clue: this.gameSpecificData?.Clue || '',
          Presentation: this.gameSpecificData?.Presentation || 'A'
        };
      case 'memory':
        return {
          ...baseData,
          ...this.gameSpecificData
        };
      case 'puzzle':
        return {
          ...baseData,
          ...this.gameSpecificData
        };
      case 'solve_the_word':
        return {
          ...baseData,
          ...this.gameSpecificData
        };
      default:
        return baseData;
    }
  }

  closeModal() {
    this.onClose.emit();
  }

  getGameTypeName(type: string | undefined): string {
    const names: { [key: string]: string } = {
      hangman: 'Ahorcado',
      memory: 'Memoria',
      puzzle: 'Rompecabezas',
      solve_the_word: 'Sopa de Letras'
    };
    return names[type || ''] || 'Juego';
  }
}
