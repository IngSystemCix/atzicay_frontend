import { Injectable, inject } from '@angular/core';
import { LoadingService } from './loading.service';
import { Observable, of, delay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameLoadingService {
  private readonly loadingService = inject(LoadingService);
  
  // Caché para evitar cargas innecesarias
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  /**
   * Carga un juego con optimizaciones
   * @param gameId ID del juego
   * @param loadFunction Función que carga el juego
   * @param forceReload Si debe recargar aunque esté en caché
   */
  async loadGame<T>(
    gameId: string | number,
    loadFunction: () => Promise<T>,
    forceReload: boolean = false
  ): Promise<T> {
    const cacheKey = `game_${gameId}`;
    
    // Si ya está en caché y no se fuerza la recarga
    if (this.cache.has(cacheKey) && !forceReload) {
      return this.cache.get(cacheKey);
    }
    
    // Si ya hay una carga en progreso para este juego, esperar a que termine
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }
    
    // Crear la promesa de carga
    const loadPromise = this.executeGameLoad(cacheKey, loadFunction);
    this.loadingPromises.set(cacheKey, loadPromise);
    
    try {
      const result = await loadPromise;
      this.cache.set(cacheKey, result);
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Ejecuta la carga del juego con loading optimizado
   */
  private async executeGameLoad<T>(cacheKey: string, loadFunction: () => Promise<T>): Promise<T> {
    return this.loadingService.withLoading(
      async () => {
        // Añadir un pequeño delay para mejorar la percepción de carga
        await new Promise(resolve => setTimeout(resolve, 100));
        return await loadFunction();
      },
      'Cargando juego...',
      true,
      3 // Prioridad alta para juegos
    );
  }

  /**
   * Carga de datos específicos del juego con mensajes descriptivos
   */
  async loadGameData<T>(
    operation: () => Promise<T>,
    step: 'auth' | 'config' | 'content' | 'assets' | 'init',
    gameId?: string | number
  ): Promise<T> {
    const messages = {
      auth: 'Verificando acceso...',
      config: 'Cargando configuración...',
      content: 'Preparando contenido...',
      assets: 'Cargando recursos...',
      init: 'Iniciando juego...'
    };

    const priority = {
      auth: 4, // Máxima prioridad
      config: 3,
      content: 2,
      assets: 1,
      init: 2
    };

    return this.loadingService.withLoading(
      operation,
      messages[step],
      step !== 'assets', // No mostrar logo para assets
      priority[step]
    );
  }

  /**
   * Precarga datos del juego en background
   */
  preloadGame(gameId: string | number, loadFunction: () => Promise<any>): void {
    const cacheKey = `game_${gameId}`;
    
    if (!this.cache.has(cacheKey) && !this.loadingPromises.has(cacheKey)) {
      // Cargar en background sin mostrar loading
      loadFunction().then(result => {
        this.cache.set(cacheKey, result);
      }).catch(error => {
        console.warn(`Error precargando juego ${gameId}:`, error);
      });
    }
  }

  /**
   * Limpia la caché de un juego específico
   */
  clearGameCache(gameId: string | number): void {
    const cacheKey = `game_${gameId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Limpia toda la caché de juegos
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Muestra loading para operaciones de juego
   */
  showGameLoading(message?: string): void {
    this.loadingService.show(
      message || 'Procesando...',
      true,
      2 // Prioridad media
    );
  }

  /**
   * Oculta loading de juegos
   */
  hideGameLoading(): void {
    this.loadingService.hide(2); // Solo oculta loadings de prioridad 2 o menor
  }

  /**
   * Actualiza mensaje de loading de juego
   */
  updateGameMessage(message: string): void {
    this.loadingService.updateMessage(message);
  }

  /**
   * Loading específico para validación de tokens de juego
   */
  async validateGameToken<T>(
    tokenValidation: () => Promise<T>
  ): Promise<T> {
    return this.loadingService.withLoading(
      tokenValidation,
      'Validando acceso al juego...',
      true,
      4 // Prioridad muy alta
    );
  }

  /**
   * Loading para guardar progreso del juego
   */
  async saveGameProgress<T>(
    saveOperation: () => Promise<T>,
    gameType?: string
  ): Promise<T> {
    const message = gameType 
      ? `Guardando progreso de ${gameType}...`
      : 'Guardando progreso...';
      
    return this.loadingService.withLoading(
      saveOperation,
      message,
      false, // Sin logo para operaciones rápidas
      1 // Prioridad baja
    );
  }

  /**
   * Loading súper rápido para juegos - Sin delays
   */
  showFastGameLoading(message: string = 'Cargando...'): void {
    this.loadingService.show(message, true, 15); // Prioridad máxima
  }

  /**
   * Oculta inmediatamente cualquier loading
   */
  hideFast(): void {
    this.loadingService.hide();
  }

  /**
   * Para autenticación súper rápida
   */
  showFastAuth(): void {
    this.loadingService.show('Verificando...', true, 20); // Prioridad extrema
  }
}
