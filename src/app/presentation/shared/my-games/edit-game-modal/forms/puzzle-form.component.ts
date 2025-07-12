import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameConfiguration } from '../../../../../core/domain/model/game-configuration.model';

@Component({
  selector: 'app-puzzle-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Configuración de Rompecabezas</h3>
      
      <!-- Imagen del puzzle -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Imagen del rompecabezas</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          @if (imagePreview) {
            <div class="relative">
              <img [src]="imagePreview" alt="Preview" class="max-w-full h-48 object-cover rounded mx-auto">
              <button 
                (click)="removeImage()"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          } @else {
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="mt-4">
                <label class="cursor-pointer">
                  <span class="mt-2 block text-sm font-medium text-gray-900">Seleccionar imagen</span>
                  <input type="file" class="sr-only" (change)="onFileSelected($event)" accept="image/*">
                </label>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Pista -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Pista del rompecabezas</label>
        <textarea 
          [(ngModel)]="formData.Clue"
          (ngModelChange)="emitData()"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent"
          placeholder="Ingrese una pista para ayudar a resolver el rompecabezas"></textarea>
      </div>

      <!-- Configuración de dimensiones -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Filas</label>
          <select 
            [(ngModel)]="formData.Rows"
            (ngModelChange)="emitData()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
            <option value="3">3 filas</option>
            <option value="4">4 filas</option>
            <option value="5">5 filas</option>
            <option value="6">6 filas</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Columnas</label>
          <select 
            [(ngModel)]="formData.Cols"
            (ngModelChange)="emitData()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
            <option value="3">3 columnas</option>
            <option value="4">4 columnas</option>
            <option value="5">5 columnas</option>
            <option value="6">6 columnas</option>
          </select>
        </div>
      </div>

      <!-- Ayuda automática -->
      <div class="flex items-center">
        <label class="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            [(ngModel)]="formData.AutomaticHelp"
            (ngModelChange)="emitData()"
            class="sr-only">
          <div class="relative">
            <div class="w-10 h-6 bg-gray-300 rounded-full shadow-inner transition-colors duration-300"
                 [class.bg-[#8571FB]]="formData.AutomaticHelp"></div>
            <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition-transform duration-300"
                 [class.transform]="formData.AutomaticHelp"
                 [class.translate-x-4]="formData.AutomaticHelp"></div>
          </div>
          <span class="ml-3 text-sm font-medium text-gray-700">Ayuda automática</span>
        </label>
      </div>
      <p class="text-xs text-gray-500 mt-1 ml-13">
        Cuando esté activada, el sistema proporcionará pistas automáticamente durante el juego.
      </p>

      <!-- Vista previa de la configuración -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Vista previa de la configuración</h4>
        <div class="text-sm text-gray-600">
          <p><span class="font-medium">Dimensiones:</span> {{ formData.Rows }} x {{ formData.Cols }} ({{ formData.Rows * formData.Cols }} piezas)</p>
          <p><span class="font-medium">Ayuda automática:</span> {{ formData.AutomaticHelp ? 'Activada' : 'Desactivada' }}</p>
        </div>
      </div>
    </div>
  `
})
export class PuzzleFormComponent implements OnInit {
  @Input() gameConfig: GameConfiguration | null = null;
  @Output() dataChange = new EventEmitter<any>();

  formData: any = {
    PathImg: '',
    Clue: '',
    Rows: 4,
    Cols: 4,
    AutomaticHelp: true
  };

  imagePreview: string | null = null;

  ngOnInit() {
    if (this.gameConfig?.puzzle) {
      const puzzle = this.gameConfig.puzzle;
      this.formData.PathImg = puzzle.path_img;
      this.formData.Clue = puzzle.clue;
      this.formData.Rows = puzzle.rows;
      this.formData.Cols = puzzle.cols;
      this.formData.AutomaticHelp = puzzle.automatic_help;
      
      if (puzzle.path_img) {
        this.imagePreview = puzzle.path_img;
      }
    }
    
    this.emitData();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.formData.PathImg = base64String;
        this.imagePreview = base64String;
        this.emitData();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.formData.PathImg = '';
    this.imagePreview = null;
    this.emitData();
  }

  emitData() {
    this.dataChange.emit(this.formData);
  }
}
