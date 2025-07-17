import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private readonly RETURN_URL_KEY = 'returnUrl';

  constructor(private router: Router) {}

  setReturnUrl(url: string): void {
    const isProgrammingGame =
      /\/play\/(hangman|puzzle|memory|solve-the-word)\//.test(url);
    if (isProgrammingGame) {
      sessionStorage.setItem(this.RETURN_URL_KEY, url);
    }
  }

  getReturnUrl(): string | null {
    return sessionStorage.getItem(this.RETURN_URL_KEY);
  }

  clearReturnUrl(): void {
    sessionStorage.removeItem(this.RETURN_URL_KEY);
  }

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