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
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-slideUp">
        <!-- Header con gradiente -->
        <div class="sticky top-0 bg-atzicay-purple-500 text-white px-8 py-6 rounded-t-2xl">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold">
                  Editar {{ getGameTypeName(gameData?.type_game) }}
                </h2>
                <p class="text-white/70 text-sm">Personaliza tu juego</p>
              </div>
            </div>
            <button 
              (click)="closeModal()"
              class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content con scroll suave -->
        <div class="overflow-y-auto max-h-[calc(95vh-140px)] custom-scrollbar">
          <div class="p-8">
            @if (loading) {
              <div class="flex flex-col items-center justify-center py-16">
                <div class="relative">
                  <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                  <div class="animate-spin rounded-full h-16 w-16 border-4 border-[#8571FB] border-t-transparent absolute top-0 left-0"></div>
                </div>
                <p class="mt-4 text-gray-600 font-medium">Cargando configuración...</p>
              </div>
            } @else if (error) {
              <div class="text-center py-16">
                <div class="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">¡Ups! Algo salió mal</h3>
                <p class="text-gray-600 mb-6">{{ error }}</p>
                <button 
                  (click)="loadGameData()"
                  class="px-6 py-3 bg-[#8571FB] text-white rounded-xl hover:bg-[#7161EB] transition-all duration-200 hover:shadow-lg hover:scale-105 font-medium">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <span>Reintentar</span>
                  </div>
                </button>
              </div>
            } @else if (gameConfig) {
              <!-- Formulario común mejorado -->
              <div class="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <div class="w-8 h-8 bg-[#8571FB] rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  Configuración General
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Nombre del juego</label>
                    <div class="relative">
                      <input 
                        type="text" 
                        [(ngModel)]="editForm.Name"
                        class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8571FB] focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                        placeholder="Ingrese el nombre del juego">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Dificultad</label>
                    <div class="relative">
                      <select 
                        [(ngModel)]="editForm.Difficulty"
                        class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8571FB] focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md appearance-none">
                        <option value="E">🟢 Fácil</option>
                        <option value="M">🟡 Medio</option>
                        <option value="H">🔴 Difícil</option>
                      </select>
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-6">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                  <div class="relative">
                    <textarea 
                      [(ngModel)]="editForm.Description"
                      rows="4"
                      class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8571FB] focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                      placeholder="Ingrese una descripción atractiva del juego..."></textarea>
                    <div class="absolute top-3 left-4 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Visibilidad</label>
                    <div class="relative">
                      <select 
                        [(ngModel)]="editForm.Visibility"
                        class="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8571FB] focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md appearance-none">
                        <option value="P">🌍 Público</option>
                        <option value="R">🔒 Restringido</option>
                      </select>
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </div>
                      <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-300 shadow-sm">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div>
                        <span class="text-sm font-semibold text-gray-700">Estado del juego</span>
                        <p class="text-xs text-gray-500">{{ editForm.Activated ? 'Activado' : 'Desactivado' }}</p>
                      </div>
                    </div>
                    <label class="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        [(ngModel)]="editForm.Activated"
                        class="sr-only">
                      <div class="relative">
                        <div class="w-14 h-8 bg-gray-300 rounded-full shadow-inner transition-all duration-300 ease-in-out"
                             [class.bg-[#8571FB]]="editForm.Activated"
                             [class.shadow-lg]="editForm.Activated"></div>
                        <div class="absolute w-6 h-6 bg-white rounded-full shadow-lg top-1 left-1 transition-all duration-300 ease-in-out"
                             [class.transform]="editForm.Activated"
                             [class.translate-x-6]="editForm.Activated"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Formulario específico por tipo de juego -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-[#8571FB] to-[#6B46C1] rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                    </svg>
                  </div>
                  Configuración Específica - {{ getGameTypeName(gameData?.type_game) }}
                </h3>
                
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
              </div>
            }
          </div>
        </div>

        <!-- Footer mejorado -->
        <div class="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-2xl">
          <div class="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              (click)="closeModal()"
              class="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium hover:shadow-md">
              Cancelar
            </button>
            <button 
              (click)="saveGame()"
              [disabled]="saving"
              class="w-full sm:w-auto px-8 py-3 bg-atzicay-bg-button text-white rounded-xl hover:from-[#7161EB] hover:to-[#5B21B6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:scale-105">
              @if (saving) {
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Guardando...
                </div>
              } @else {
                <div class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Guardar Cambios
                </div>
              }
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      
      .animate-slideUp {
        animation: slideUp 0.3s ease-out;
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #8571FB;
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #7161EB;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      select {
        background-image: none;
      }
    </style>
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
