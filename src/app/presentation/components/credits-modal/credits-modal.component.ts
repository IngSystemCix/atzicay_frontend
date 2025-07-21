import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

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
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
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

            <div class="space-y-3">
              <div
                *ngFor="let dev of developers"
                class="group bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 ease-out"
              >
                <div class="flex items-center justify-between">
                  <!-- Avatar y nombre -->
                  <div class="flex items-center space-x-3">
                    <div
                      class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-atzicay-purple-400 to-atzicay-purple-600 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <span class="text-atzicay-purple-700 font-semibold text-sm">
                        {{ dev.name.split(' ')[0][0]
                        }}{{
                          dev.name.split(' ')[2]
                            ? dev.name.split(' ')[2][0]
                            : dev.name.split(' ')[1][0]
                        }}
                      </span>
                    </div>

                    <div>
                      <p
                        class="text-gray-800 font-semibold text-sm leading-tight"
                      >
                        {{ dev.name }}
                      </p>
                      <p class="text-gray-500 text-xs mt-0.5">Desarrollador</p>
                    </div>
                  </div>

                  <!-- Badge del rol -->
                  <div class="flex-shrink-0">
                    <span
                      class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800 border border-blue-200':
                          dev.role === 'Frontend Developer',
                        'bg-green-100 text-green-800 border border-green-200':
                          dev.role === 'Backend Developer',
                        'bg-orange-100 text-orange-800 border border-orange-200':
                          dev.role === 'QA Tester'
                      }"
                    >
                      <!-- Iconos por rol -->
                      <svg
                        *ngIf="dev.role === 'Frontend Developer'"
                        class="w-3 h-3 mr-1.5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>

                      <svg
                        *ngIf="dev.role === 'Backend Developer'"
                        class="w-3 h-3 mr-1.5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                        />
                      </svg>

                      <svg
                        *ngIf="dev.role === 'QA Tester'"
                        class="w-3 h-3 mr-1.5 text-orange-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>

                      {{
                        dev.role === 'Frontend Developer'
                          ? 'Frontend'
                          : dev.role === 'Backend Developer'
                          ? 'Backend'
                          : 'QA Tester'
                      }}
                    </span>
                  </div>
                </div>

                <!-- Línea decorativa que aparece en hover -->
                <div
                  class="mt-3 h-0.5 bg-gradient-to-r from-atzicay-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
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

  developers = [
    { name: 'Juan Rodrigo Tejeda Riojas', role: 'Frontend Developer' },
    { name: 'Daniel David Ramos Marrufo', role: 'Frontend Developer' },
    { name: 'Juan Bladimir Romero Collazos', role: 'Backend Developer' },
    { name: 'Brian Augusto Monteza Alvarez', role: 'Backend Developer' },
    { name: 'Jorge Hugo Fupuy Chanamé', role: 'QA Tester' },
  ];

  advisor = 'Franklin Edinson Teran Santa Cruz';
  currentYear = new Date().getFullYear();
  @Input() isOpen: boolean = false;

  closeModal() {
    this.close.emit();
  }
}
