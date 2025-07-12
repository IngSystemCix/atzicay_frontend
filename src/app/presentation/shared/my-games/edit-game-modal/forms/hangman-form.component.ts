import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameConfiguration } from '../../../../../core/domain/model/game-configuration.model';

@Component({
  selector: 'app-hangman-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Configuración del Ahorcado</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Palabra</label>
          <input 
            type="text" 
            [(ngModel)]="formData.Word"
            (ngModelChange)="emitData()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent"
            placeholder="Ingrese la palabra">
          <p class="text-xs text-gray-500 mt-1">Puede incluir tildes y caracteres especiales</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Presentación</label>
          <select 
            [(ngModel)]="formData.Presentation"
            (ngModelChange)="emitData()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
            <option value="A">Automática</option>
            <option value="M">Manual</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Automática: Se revela automáticamente. Manual: El usuario escribe la palabra</p>
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Pista</label>
        <textarea 
          [(ngModel)]="formData.Clue"
          (ngModelChange)="emitData()"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent"
          placeholder="Ingrese una pista que ayude a adivinar la palabra"></textarea>
      </div>

      <!-- Vista previa de la configuración -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Vista previa de la configuración</h4>
        <div class="text-sm text-gray-600">
          <p><span class="font-medium">Palabra:</span> {{ formData.Word || 'No especificada' }}</p>
          <p><span class="font-medium">Longitud:</span> {{ formData.Word?.length || 0 }} caracteres</p>
          <p><span class="font-medium">Presentación:</span> {{ formData.Presentation === 'A' ? 'Automática' : 'Manual' }}</p>
          <p><span class="font-medium">Pista:</span> {{ formData.Clue || 'Sin pista' }}</p>
          
          @if (formData.Word) {
            <div class="mt-3">
              <span class="font-medium">Vista de la palabra:</span>
              <div class="flex gap-1 mt-1">
                @for (letter of getWordLetters(); track $index) {
                  <span class="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center text-xs font-bold bg-white">
                    {{ letter.toUpperCase() }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HangmanFormComponent implements OnInit {
  @Input() gameConfig: GameConfiguration | null = null;
  @Output() dataChange = new EventEmitter<any>();

  formData: any = {
    Word: '',
    Presentation: 'A',
    Clue: ''
  };

  ngOnInit() {
    if (this.gameConfig?.hangman_words && this.gameConfig.hangman_words.length > 0) {
      const hangmanData = this.gameConfig.hangman_words[0];
      this.formData = {
        Word: hangmanData.word || '',
        Presentation: hangmanData.presentation || 'A',
        Clue: hangmanData.clue || ''
      };
    }
    
    this.emitData();
  }

  getWordLetters(): string[] {
    return this.formData.Word ? this.formData.Word.split('') : [];
  }

  emitData() {
    this.dataChange.emit(this.formData);
  }
}
