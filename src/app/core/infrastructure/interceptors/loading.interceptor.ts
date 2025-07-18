import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize, delay } from 'rxjs/operators';
import { LoadingService } from '../service/loading.service';

let activeRequests = 0;
let loadingTimeout: any;

// URLs que no deben mostrar loading automático
const EXCLUDED_URLS = [
  '/api/auth/',
  '/api/token/',
  '/api/user/session',
  '/api/validate',
  '/.well-known/',
  '/oauth/',
  '/login',
  '/logout',
  '/api/user/',
  '/api/session',
  '/connect/',
  '/callback',
  '/api/game-instances', 
  '/api/hangman/', // Excluir hangman para carga rápida
  '/api/puzzle/', // Excluir puzzle para carga rápida
  '/api/memory/', // Excluir memory para carga rápida
  '/api/solve-the-word/', // Excluir solve-the-word para carga rápida
  '/api/games/', // Excluir todas las peticiones de games
  '/api/word-search/', // Por si usa otra ruta
  '/api/game/' // Patrones generales de juegos
];

// Headers que indican que no se debe mostrar loading
const SKIP_LOADING_HEADER = 'X-Skip-Loading';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loadingService = inject(LoadingService);
  
  // Verificar si esta petición debe ser excluida del loading
  const shouldSkipLoading = shouldSkipLoadingForRequest(request);
  
  if (!shouldSkipLoading) {
    // Incrementar contador de peticiones activas
    activeRequests++;
    
    // Mostrar loading inmediatamente para peticiones que realmente lo necesitan
    if (activeRequests === 1) {
      loadingTimeout = setTimeout(() => {
        if (activeRequests > 0) {
          loadingService.show('Cargando datos...', true);
        }
      }, 100); // Delay mínimo de 100ms
    }
  }

  return next(request).pipe(
    finalize(() => {
      if (!shouldSkipLoading) {
        // Decrementar contador de peticiones activas
        activeRequests--;
        
        // Ocultar loading si no hay más peticiones activas
        if (activeRequests === 0) {
          // Limpiar el timeout si existe
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
          loadingService.hide();
        }
      }
    })
  );
};

function shouldSkipLoadingForRequest(request: any): boolean {
  // Verificar header para saltar loading
  if (request.headers.has(SKIP_LOADING_HEADER)) {
    return true;
  }
  
  // Verificar URLs excluidas
  const url = request.url.toLowerCase();
  return EXCLUDED_URLS.some(excludedUrl => url.includes(excludedUrl));
}
