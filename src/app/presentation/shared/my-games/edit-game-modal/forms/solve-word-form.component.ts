import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameConfiguration } from '../../../../../core/domain/model/game-configuration.model';

interface WordItem {
  Id?: number;
  Word: string;
  Orientation: string;
}

@Component({
  selector: 'app-solve-word-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Configuración de Sopa de Letras</h3>
      
      <!-- Configuración de dimensiones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Filas</label>
          <select 
            [(ngModel)]="formData.Rows"
            (ngModelChange)="emitData()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
            <option value="8">8 filas</option>
            <option value="10">10 filas</option>
            <option value="12">12 filas</option>
            <option value="15">15 filas</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Columnas</label>
          <select 
            [(ngModel)]="formData.Cols"
            (ngModelChange)="emitData()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
            <option value="8">8 columnas</option>
            <option value="10">10 columnas</option>
            <option value="12">12 columnas</option>
            <option value="15">15 columnas</option>
          </select>
        </div>
      </div>

      <!-- Lista de palabras -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-3">
          <label class="block text-sm font-medium text-gray-700">Palabras en la sopa</label>
          <button 
            (click)="addWord()"
            class="px-3 py-1 bg-[#8571FB] text-white text-sm rounded-lg hover:bg-[#7161EB] transition-colors">
            + Agregar palabra
          </button>
        </div>

        <div class="space-y-3">
          @for (word of formData.Words; track $index; let i = $index) {
            <div class="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <div class="flex-1">
                <input 
                  type="text" 
                  [(ngModel)]="word.Word"
                  (ngModelChange)="onWordChange()"
                  placeholder="Ingrese la palabra"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#8571FB] focus:border-transparent text-sm">
              </div>
              <div class="w-32">
                <select 
                  [(ngModel)]="word.Orientation"
                  (ngModelChange)="onWordChange()"
                  class="w-full px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#8571FB] focus:border-transparent text-sm">
                  <option value="HL">← Izquierda</option>
                  <option value="HR">Derecha →</option>
                  <option value="VU">↑ Arriba</option>
                  <option value="VD">↓ Abajo</option>
                  <option value="DU">↗ Diagonal ↗</option>
                  <option value="DD">↘ Diagonal ↘</option>
                </select>
              </div>
              <button 
                (click)="removeWord(i)"
                class="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          } @empty {
            <div class="text-center py-8 text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p class="mt-2">No hay palabras agregadas</p>
              <p class="text-sm">Haz clic en "Agregar palabra" para comenzar</p>
            </div>
          }
        </div>
      </div>

      <!-- Vista previa de la configuración -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Vista previa de la configuración</h4>
        <div class="text-sm text-gray-600">
          <p><span class="font-medium">Dimensiones de la grilla:</span> {{ formData.Rows }} x {{ formData.Cols }}</p>
          <p><span class="font-medium">Total de palabras:</span> {{ formData.Words.length }}</p>
          <div class="mt-2">
            <span class="font-medium">Orientaciones usadas:</span>
            <div class="flex flex-wrap gap-1 mt-1">
              @for (orientation of getUsedOrientations(); track orientation) {
                <span class="px-2 py-1 bg-white rounded text-xs border">{{ getOrientationLabel(orientation) }}</span>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SolveWordFormComponent implements OnInit {
  @Input() gameConfig: GameConfiguration | null = null;
  @Output() dataChange = new EventEmitter<any>();

  formData: any = {
    Rows: 10,
    Cols: 10,
    Words: []
  };

  ngOnInit() {
    if (this.gameConfig?.solve_the_word) {
      // Obtener dimensiones desde settings si están disponibles
      if (this.gameConfig.settings) {
        const rowsSetting = this.gameConfig.settings.find(s => s.key === 'Rows');
        const colsSetting = this.gameConfig.settings.find(s => s.key === 'Cols');
        
        if (rowsSetting) this.formData.Rows = parseInt(rowsSetting.value);
        if (colsSetting) this.formData.Cols = parseInt(colsSetting.value);
      }
      
      // Cargar palabras
      this.formData.Words = this.gameConfig.solve_the_word.map(word => ({
        Id: (word as any).Id || undefined,
        Word: word.word,
        Orientation: word.orientation
      }));
    }
    
    // Si no hay palabras, agregar una por defecto
    if (this.formData.Words.length === 0) {
      this.addWord();
    }
    
    this.emitData();
  }

  addWord() {
    this.formData.Words.push({
      Word: '',
      Orientation: 'HR'
    });
    this.onWordChange();
  }

  removeWord(index: number) {
    this.formData.Words.splice(index, 1);
    this.onWordChange();
  }

  onWordChange() {
    this.emitData();
  }

  getUsedOrientations(): string[] {
    const orientations = this.formData.Words
      .map((word: WordItem) => word.Orientation)
      .filter((orientation: string) => orientation);
    return [...new Set(orientations as string[])];
  }

  getOrientationLabel(orientation: string): string {
    const labels: { [key: string]: string } = {
      'HL': '← Izquierda',
      'HR': 'Derecha →',
      'VU': '↑ Arriba',
      'VD': '↓ Abajo',
      'DU': '↗ Diagonal ↗',
      'DD': '↘ Diagonal ↘'
    };
    return labels[orientation] || orientation;
  }

  emitData() {
    this.dataChange.emit(this.formData);
  }
}
