import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameConfiguration } from '../../../../../core/domain/model/game-configuration.model';

@Component({
  selector: 'app-memory-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Configuración de Memoria</h3>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Modo de juego</label>
        <select 
          [(ngModel)]="formData.Mode"
          (ngModelChange)="onModeChange()"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent">
          <option value="II">Imagen - Imagen</option>
          <option value="ID">Imagen - Descripción</option>
        </select>
      </div>

      <!-- Primera imagen (siempre presente) -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Primera imagen</label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          @if (imagePreview1) {
            <div class="relative">
              <img [src]="imagePreview1" alt="Preview 1" class="max-w-full h-32 object-cover rounded mx-auto">
              <button 
                (click)="removeImage1()"
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
                  <input type="file" class="sr-only" (change)="onFileSelected($event, 1)" accept="image/*">
                </label>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Segunda imagen (solo en modo II) o Descripción (modo ID) -->
      @if (formData.Mode === 'II') {
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Segunda imagen</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            @if (imagePreview2) {
              <div class="relative">
                <img [src]="imagePreview2" alt="Preview 2" class="max-w-full h-32 object-cover rounded mx-auto">
                <button 
                  (click)="removeImage2()"
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
                    <input type="file" class="sr-only" (change)="onFileSelected($event, 2)" accept="image/*">
                  </label>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (formData.Mode === 'ID') {
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Descripción de la imagen</label>
          <textarea 
            [(ngModel)]="formData.Description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8571FB] focus:border-transparent"
            placeholder="Ingrese la descripción que coincida con la imagen"></textarea>
        </div>
      }
    </div>
  `
})
export class MemoryFormComponent implements OnInit {
  @Input() gameConfig: GameConfiguration | null = null;
  @Output() dataChange = new EventEmitter<any>();

  formData: any = {
    Mode: 'II',
    PathImage1: '',
    PathImage2: '',
    Description: ''
  };

  imagePreview1: string | null = null;
  imagePreview2: string | null = null;

  ngOnInit() {
    if (this.gameConfig?.memory_pairs && this.gameConfig.memory_pairs.length > 0) {
      const memoryPair = this.gameConfig.memory_pairs[0];
      this.formData.Mode = memoryPair.mode;
      
      if (memoryPair.path_image1) {
        this.formData.PathImage1 = memoryPair.path_image1;
        this.imagePreview1 = memoryPair.path_image1;
      }
      
      if (memoryPair.path_image2) {
        this.formData.PathImage2 = memoryPair.path_image2;
        this.imagePreview2 = memoryPair.path_image2;
      }
      
      if (memoryPair.description_image) {
        this.formData.Description = memoryPair.description_image;
      }
    }
    
    this.emitData();
  }

  onModeChange() {
    // Limpiar datos específicos del modo anterior
    if (this.formData.Mode === 'II') {
      this.formData.Description = '';
    } else {
      this.formData.PathImage2 = '';
      this.imagePreview2 = null;
    }
    this.emitData();
  }

  onFileSelected(event: any, imageNumber: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        
        if (imageNumber === 1) {
          this.formData.PathImage1 = base64String;
          this.imagePreview1 = base64String;
        } else {
          this.formData.PathImage2 = base64String;
          this.imagePreview2 = base64String;
        }
        
        this.emitData();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage1() {
    this.formData.PathImage1 = '';
    this.imagePreview1 = null;
    this.emitData();
  }

  removeImage2() {
    this.formData.PathImage2 = '';
    this.imagePreview2 = null;
    this.emitData();
  }

  private emitData() {
    this.dataChange.emit(this.formData);
  }
}
