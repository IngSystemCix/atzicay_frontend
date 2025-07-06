import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/infrastructure/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingState().isLoading) {
      <div class="fixed inset-0 flex flex-col items-center justify-center min-h-screen bg-white/90 backdrop-blur-md z-[9999] transition-all duration-300 ease-in-out"
           style="backdrop-filter: blur(12px);">
        
        <!-- Contenedor principal con animación -->
        <div class="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm shadow-2xl border border-atzicay-border/50 transform transition-all duration-500 ease-out animate-fade-in">
          
          <!-- Logo de Atzicay animado -->
          @if (loadingState().showLogo) {
            <div class="mb-6 transform transition-all duration-700 ease-out animate-bounce-gentle">
              <div class="relative">
                <!-- Círculo de fondo con gradiente -->
                <div class="absolute inset-0 bg-gradient-to-br from-atzicay-purple-500/20 to-purple-600/30 rounded-full blur-lg scale-110 animate-pulse-slow"></div>
                
                <!-- Logo container -->
                <div class="relative bg-gradient-to-br from-white to-atzicay-bg rounded-full p-6 shadow-xl border-2 border-atzicay-border/40">
                  <svg xmlns="http://www.w3.org/2000/svg"
                       class="h-12 w-12 text-atzicay-purple-500 transform transition-transform duration-1000 animate-spin-slow"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Nombre de la marca -->
            <div class="mb-6 text-center animate-fade-in-up">
              <h2 class="text-2xl font-black tracking-wider mb-1 bg-gradient-to-r from-atzicay-purple-500 to-purple-600 bg-clip-text text-transparent">
                ATZICAY
              </h2>
              <div class="h-1 w-16 bg-gradient-to-r from-atzicay-purple-500 to-purple-600 rounded-full mx-auto"></div>
            </div>
          }
          
          <!-- Spinner principal -->
          <div class="relative mb-6">
            <!-- Spinner externo -->
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-atzicay-purple-500/20 border-t-atzicay-purple-500 shadow-lg"></div>
            
            <!-- Spinner interno -->
            <div class="absolute inset-2 animate-spin rounded-full h-12 w-12 border-3 border-transparent border-t-purple-400 animate-reverse-spin"></div>
            
            <!-- Punto central -->
            <div class="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-br from-atzicay-purple-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
          
          <!-- Mensaje de carga -->
          <div class="text-center animate-fade-in-up">
            <p class="text-atzicay-purple-500 text-lg font-semibold mb-2 animate-pulse-text">
              {{ loadingState().message }}
            </p>
            
            <!-- Puntos animados -->
            <div class="flex justify-center items-center space-x-1">
              <div class="w-2 h-2 bg-atzicay-purple-500 rounded-full animate-bounce-dot-1"></div>
              <div class="w-2 h-2 bg-atzicay-purple-500 rounded-full animate-bounce-dot-2"></div>
              <div class="w-2 h-2 bg-atzicay-purple-500 rounded-full animate-bounce-dot-3"></div>
            </div>
          </div>
          
          <!-- Barra de progreso decorativa -->
          <div class="mt-6 w-48 h-1 bg-atzicay-purple-500/20 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-atzicay-purple-500 to-purple-600 rounded-full animate-progress-bar"></div>
          </div>
        </div>
        
        <!-- Partículas decorativas de fondo -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-atzicay-purple-500/30 rounded-full animate-float-1"></div>
          <div class="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-float-2"></div>
          <div class="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-atzicay-purple-500/25 rounded-full animate-float-3"></div>
          <div class="absolute bottom-1/3 right-1/3 w-1 h-1 bg-purple-500/35 rounded-full animate-float-1"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes bounce-gentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes reverse-spin {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
    
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    
    @keyframes pulse-text {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 1; }
    }
    
    @keyframes bounce-dot-1 {
      0%, 80%, 100% { transform: scale(0.8) translateY(0); opacity: 0.7; }
      40% { transform: scale(1.2) translateY(-8px); opacity: 1; }
    }
    
    @keyframes bounce-dot-2 {
      0%, 80%, 100% { transform: scale(0.8) translateY(0); opacity: 0.7; }
      40% { transform: scale(1.2) translateY(-8px); opacity: 1; }
    }
    
    @keyframes bounce-dot-3 {
      0%, 80%, 100% { transform: scale(0.8) translateY(0); opacity: 0.7; }
      40% { transform: scale(1.2) translateY(-8px); opacity: 1; }
    }
    
    @keyframes progress-bar {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes float-1 {
      0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
      33% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
      66% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
    }
    
    @keyframes float-2 {
      0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
      50% { transform: translateY(-15px) translateX(-8px); opacity: 0.7; }
    }
    
    @keyframes float-3 {
      0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
      25% { transform: translateY(-25px) translateX(12px); opacity: 0.5; }
      75% { transform: translateY(-5px) translateX(-7px); opacity: 0.3; }
    }
    
    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
    
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out;
    }
    
    .animate-bounce-gentle {
      animation: bounce-gentle 2s ease-in-out infinite;
    }
    
    .animate-spin-slow {
      animation: spin-slow 3s linear infinite;
    }
    
    .animate-reverse-spin {
      animation: reverse-spin 2s linear infinite;
    }
    
    .animate-pulse-slow {
      animation: pulse-slow 2s ease-in-out infinite;
    }
    
    .animate-pulse-text {
      animation: pulse-text 1.5s ease-in-out infinite;
    }
    
    .animate-bounce-dot-1 {
      animation: bounce-dot-1 1.4s ease-in-out infinite;
      animation-delay: 0s;
    }
    
    .animate-bounce-dot-2 {
      animation: bounce-dot-2 1.4s ease-in-out infinite;
      animation-delay: 0.2s;
    }
    
    .animate-bounce-dot-3 {
      animation: bounce-dot-3 1.4s ease-in-out infinite;
      animation-delay: 0.4s;
    }
    
    .animate-progress-bar {
      animation: progress-bar 2s ease-in-out infinite;
    }
    
    .animate-float-1 {
      animation: float-1 6s ease-in-out infinite;
    }
    
    .animate-float-2 {
      animation: float-2 4s ease-in-out infinite;
    }
    
    .animate-float-3 {
      animation: float-3 5s ease-in-out infinite;
    }
  `]
})
export class GlobalLoadingComponent {
  private readonly loadingService = inject(LoadingService);
  
  // Estado reactivo del loading
  public readonly loadingState = computed(() => this.loadingService.loadingState());
}
