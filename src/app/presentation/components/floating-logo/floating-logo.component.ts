import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RedirectService } from '../../../core/infrastructure/service/RedirectService.service';

@Component({
  selector: 'app-floating-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="goToDashboard()"
      class="hidden md:flex fixed top-4 left-4 z-50 bg-white backdrop-blur-md rounded-2xl shadow-lg border border-atzicay-border p-4 transition-all duration-300 hover:shadow-xl focus:outline-none cursor-pointer"
      aria-label="Ir al dashboard"
    >
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg"
             class="h-10 w-10 text-atzicay-purple-500 flex-shrink-0 mr-3"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span class="text-xl font-bold text-atzicay-purple-500 tracking-wide">
          ATZICAY
        </span>
      </div>
    </button>
  `,
  styles: []
})
export class FloatingLogoComponent {
  constructor(private router: Router, private redirectService: RedirectService) {}

  goToDashboard() {
    this.redirectService.clearReturnUrl();
    this.router.navigate(['/dashboard']);
  }
}
