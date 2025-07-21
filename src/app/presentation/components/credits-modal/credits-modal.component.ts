import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-credits-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 bg-opacity-60 flex items-center justify-center z-50 p-4"
      (click)="closeModal()"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto "
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="bg-atzicay-purple-500 text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0z"
                />
              </svg>
              <h2 class="text-xl font-bold">Créditos del Proyecto</h2>
            </div>
            <button
              (click)="closeModal()"
              class="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <div>
            <h3
              class="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2 text-atzicay-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              Desarrolladores
            </h3>

            <!-- Frontend Developers -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-blue-600 mb-3 uppercase tracking-wide">Frontend Team</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  *ngFor="let dev of frontendDevelopers"
                  class="group bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-out"
                >
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span class="text-white font-semibold text-sm">
                        {{ dev.name.split(' ')[0][0] }}{{ dev.name.split(' ')[2] ? dev.name.split(' ')[2][0] : dev.name.split(' ')[1][0] }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-gray-800 font-semibold text-sm leading-tight truncate">{{ dev.name }}</p>
                      <p class="text-blue-600 text-xs mt-0.5">Frontend Developer</p>
                    </div>
                  </div>
                  <!-- Línea decorativa que aparece en hover -->
                  <div class="mt-3 h-0.5 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>

            <!-- Backend Developers -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-green-600 mb-3 uppercase tracking-wide">Backend Team</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  *ngFor="let dev of backendDevelopers"
                  class="group bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-out"
                >
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <span class="text-white font-semibold text-sm">
                        {{ dev.name.split(' ')[0][0] }}{{ dev.name.split(' ')[2] ? dev.name.split(' ')[2][0] : dev.name.split(' ')[1][0] }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-gray-800 font-semibold text-sm leading-tight truncate">{{ dev.name }}</p>
                      <p class="text-green-600 text-xs mt-0.5">Backend Developer</p>
                    </div>
                  </div>
                  <!-- Línea decorativa que aparece en hover -->
                  <div class="mt-3 h-0.5 bg-gradient-to-r from-green-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>

            <!-- QA Tester -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-orange-600 mb-3 uppercase tracking-wide">Quality Assurance</h4>
              <div class="max-w-md">
                <div
                  *ngFor="let dev of qaTester"
                  class="group bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-out"
                >
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                      <span class="text-white font-semibold text-sm">
                        {{ dev.name.split(' ')[0][0] }}{{ dev.name.split(' ')[2] ? dev.name.split(' ')[2][0] : dev.name.split(' ')[1][0] }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-gray-800 font-semibold text-sm leading-tight truncate">{{ dev.name }}</p>
                      <p class="text-orange-600 text-xs mt-0.5">QA Tester</p>
                    </div>
                  </div>
                  <!-- Línea decorativa que aparece en hover -->
                  <div class="mt-3 h-0.5 bg-gradient-to-r from-orange-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Asesor Section -->
          <div>
            <h3
              class="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2 text-atzicay-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Asesor Académico
            </h3>
            <div class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <p class="text-blue-900 font-semibold">{{ advisor }}</p>
              <p class="text-blue-700 text-sm mt-1">Docente del Curso</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">
              Herramientas de Desarrollo
            </p>
            <p class="text-xs text-gray-500 mt-1">
              © {{ currentYear }} ATZICAY
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CreditsModalComponent {
  @Output() close = new EventEmitter<void>();

  frontendDevelopers = [
    { name: 'Juan Rodrigo Tejeda Riojas', role: 'Frontend Developer' },
    { name: 'Daniel David Ramos Marrufo', role: 'Frontend Developer' }
  ];

  backendDevelopers = [
    { name: 'Juan Bladimir Romero Collazos', role: 'Backend Developer' },
    { name: 'Brian Augusto Monteza Alvarez', role: 'Backend Developer' }
  ];

  qaTester = [
    { name: 'Jorge Hugo Fupuy Chanamé', role: 'QA Tester' }
  ];

  advisor = 'Franklin Edinson Teran Santa Cruz';
  currentYear = new Date().getFullYear();
  @Input() isOpen: boolean = false;

  closeModal() {
    this.close.emit();
  }
}