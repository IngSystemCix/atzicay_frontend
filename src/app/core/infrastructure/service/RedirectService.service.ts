import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private readonly RETURN_URL_KEY = 'returnUrl';

  constructor(private router: Router) {}

  // Guardar URL de retorno
  setReturnUrl(url: string): void {
    // Solo guardar si es un juego programado de cualquiera de los 4 juegos
    const isProgrammingGame =
      /\/play\/(hangman|puzzle|memory|solve-the-word)\//.test(url);
    if (isProgrammingGame) {
      console.log('[RedirectService] Guardando URL de retorno (programado):', url);
      sessionStorage.setItem(this.RETURN_URL_KEY, url);
    }
  }

  // Obtener URL de retorno
  getReturnUrl(): string | null {
    return sessionStorage.getItem(this.RETURN_URL_KEY);
  }

  // Limpiar URL de retorno
  clearReturnUrl(): void {
    sessionStorage.removeItem(this.RETURN_URL_KEY);
  }

  // Redirigir después del login
  redirectAfterLogin(): void {
    const returnUrl = this.getReturnUrl();
    
    if (returnUrl) {
      console.log('[RedirectService] Redirigiendo a URL guardada:', returnUrl);
      this.clearReturnUrl();
      this.router.navigateByUrl(returnUrl);
    } else {
      console.log('[RedirectService] Redirigiendo a dashboard');
      this.router.navigate(['/dashboard']);
    }
  }
}