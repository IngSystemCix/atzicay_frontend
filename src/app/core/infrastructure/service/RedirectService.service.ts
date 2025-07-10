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
    const isGameUrl = url.includes('/play/') || 
                     url.includes('/juegos/jugar-') || 
                     url.includes('/game/');
    
    if (isGameUrl) {
      console.log('[RedirectService] Guardando URL de retorno:', url);
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