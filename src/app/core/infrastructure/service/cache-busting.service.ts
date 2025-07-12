import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheBustingService {
  private _cacheVersion = new BehaviorSubject<string>('');
  
  constructor() {
    this.initializeCacheVersion();
  }

  /**
   * Inicializa la versión de cache
   */
  private initializeCacheVersion(): void {
    const currentVersion = Date.now().toString();
    this._cacheVersion.next(currentVersion);
  }

  /**
   * Actualiza la versión de cache - llamar cuando se crean nuevos juegos con imágenes
   */
  updateCacheVersion(): void {
    const newVersion = Date.now().toString();
    this._cacheVersion.next(newVersion);
    
    // También guardamos en sessionStorage para persistir durante la sesión
    sessionStorage.setItem('atzicay_cache_version', newVersion);
    
    console.log('Cache version updated:', newVersion);
  }

  /**
   * Obtiene la versión actual del cache
   */
  getCurrentCacheVersion(): string {
    // Primero intentar obtener de sessionStorage
    const sessionVersion = sessionStorage.getItem('atzicay_cache_version');
    if (sessionVersion) {
      return sessionVersion;
    }
    
    // Si no existe, usar la versión actual
    return this._cacheVersion.value || Date.now().toString();
  }

  /**
   * Aplica cache busting a una URL de imagen con verificación de existencia
   */
  applyCacheBusting(imageUrl: string): string {
    if (!imageUrl) {
      return imageUrl;
    }

    // Para imágenes dinámicas del storage (juegos creados), aplicar cache busting más agresivo
    if (imageUrl.includes('/storage/') || imageUrl.includes('storage/')) {
      return this.applyAggressiveCacheBusting(imageUrl);
    }

    // Para imágenes estáticas de assets, aplicar cache busting SOLO si la versión cambió
    if (imageUrl.startsWith('/assets/') || imageUrl.startsWith('assets/')) {
      // Para assets, usar cache busting más ligero solo cuando sea necesario
      const cacheVersion = this.getCurrentCacheVersion();
      
      // Solo aplicar si no tiene ya parámetros de cache o si la versión es diferente
      if (!imageUrl.includes('?v=') || !imageUrl.includes(cacheVersion)) {
        const separator = imageUrl.includes('?') ? '&' : '?';
        return `${imageUrl}${separator}v=${cacheVersion}`;
      }
      
      return imageUrl; // Ya tiene cache busting válido
    }

    // No aplicar a data URLs (base64)
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    // Para otras imágenes, aplicar cache busting moderado
    const cacheVersion = this.getCurrentCacheVersion();
    const separator = imageUrl.includes('?') ? '&' : '?';
    
    return `${imageUrl}${separator}v=${cacheVersion}`;
  }

  /**
   * Aplica cache busting agresivo para imágenes dinámicas del storage
   */
  private applyAggressiveCacheBusting(imageUrl: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const separator = imageUrl.includes('?') ? '&' : '?';
    
    // Para imágenes dinámicas, usar timestamp + random para asegurar que siempre se recarguen
    return `${imageUrl}${separator}v=${timestamp}&r=${randomId}`;
  }

  /**
   * Aplica cache busting específicamente para imágenes de juegos
   */
  applyGameImageCacheBusting(imageUrl: string, gameId?: number): string {
    if (!imageUrl) {
      return imageUrl;
    }

    // No aplicar cache busting a imágenes estáticas locales
    if (imageUrl.startsWith('/assets/') || imageUrl.startsWith('assets/')) {
      return imageUrl;
    }

    // No aplicar a data URLs (base64)
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    const cacheVersion = this.getCurrentCacheVersion();
    const timestamp = Date.now();
    const gameParam = gameId ? `&gameId=${gameId}` : '';
    const separator = imageUrl.includes('?') ? '&' : '?';
    
    return `${imageUrl}${separator}v=${cacheVersion}&t=${timestamp}${gameParam}`;
  }

  /**
   * Invalida el cache de una imagen específica
   */
  invalidateImageCache(imageUrl: string): string {
    if (!imageUrl) {
      return imageUrl;
    }

    const timestamp = Date.now();
    const separator = imageUrl.includes('?') ? '&' : '?';
    
    return `${imageUrl}${separator}invalidate=${timestamp}`;
  }

  /**
   * Limpia el cache del navegador para las imágenes
   */
  clearImageCache(): void {
    // Actualizar versión de cache
    this.updateCacheVersion();
    
    // Limpiar sessionStorage relacionado con imágenes
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.includes('image_') || key.includes('game_')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * Observable para escuchar cambios en la versión de cache
   */
  get cacheVersion$() {
    return this._cacheVersion.asObservable();
  }

  /**
   * Verifica si una imagen existe y la precarga para evitar problemas de timing
   */
  preloadAndVerifyImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(imageUrl);
      };
      
      img.onerror = () => {
        // Si falla, intentar con cache busting más agresivo
        const aggressiveUrl = this.applyAggressiveCacheBusting(imageUrl);
        
        const retryImg = new Image();
        retryImg.onload = () => resolve(aggressiveUrl);
        retryImg.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
        retryImg.src = aggressiveUrl;
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Fuerza la recarga de assets en el servidor de desarrollo
   */
  forceDevServerRefresh(): void {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Crear un fetch invisible para "despertar" el servidor de desarrollo
      fetch('/assets/.dev-refresh', { 
        method: 'HEAD',
        cache: 'no-cache'
      }).catch(() => {
        // Ignorar errores, es solo para triggear el dev server
      });
    }
  }

  /**
   * Método especial para el servidor de desarrollo de Angular
   * Fuerza la detección de nuevos archivos en el directorio public
   */
  triggerDevServerAssetScan(): void {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Intentar hacer requests a algunos assets conocidos para "despertar" el file watcher
      const testAssets = [
        '/assets/default-game.png',
        '/favicon.svg'
      ];
      
      testAssets.forEach(asset => {
        fetch(asset, { 
          method: 'HEAD',
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }).catch(() => {
          // Ignorar errores, es solo para activar el file watcher
        });
      });
      
      console.log('Dev server asset scan triggered');
    }
  }

  /**
   * Configuración especial para desarrollo que fuerza recompilación de assets
   */
  forceDevRecompilation(): void {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Crear un evento personalizado que puede ser detectado por el dev server
      const event = new CustomEvent('atzicay-force-recompile', {
        detail: { timestamp: Date.now() }
      });
      window.dispatchEvent(event);
      
      // También actualizar la versión de cache
      this.updateCacheVersion();
      
      console.log('Dev recompilation forced');
    }
  }
}
