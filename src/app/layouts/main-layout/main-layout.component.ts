import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../presentation';
import { SidebarComponent } from '../../presentation';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../core/infrastructure/api/sidebar/sidebar.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { ProfileService } from '../../core/infrastructure/api/profile.service';
import { UserSessionService } from '../../core/infrastructure/service/user-session.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  isMobile = false;

  private sidebarService = inject(SidebarService);
  private auth0 = inject(Auth0Service);
  private profileService = inject(ProfileService);
  private userSession = inject(UserSessionService);
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.checkScreenSize();
    
    if (this.isMobile) {
      this.sidebarCollapsed = true;
      this.sidebarService.setSidebarState(true);
    }

    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.sidebarCollapsed = collapsed;
      })
    );

    this.ensureUserIdLoaded();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
    
    // Auto-colapsar en móvil
    if (this.isMobile && !this.sidebarCollapsed) {
      this.toggleSidebar();
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768; // breakpoint md de Tailwind (768px)
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  // Método para cerrar sidebar en móvil (útil para llamar desde el template)
  closeSidebarOnMobile(): void {
    if (this.isMobile && !this.sidebarCollapsed) {
      this.sidebarService.setSidebarState(true);
    }
  }

  // Método para manejar el click en el overlay
  onOverlayClick(): void {
    if (this.isMobile) {
      this.toggleSidebar();
    }
  }

  private ensureUserIdLoaded() {
    const userId = this.userSession.getUserId();
    if (!userId) {
      this.auth0.user$.subscribe((user) => {
        const email = user?.email;
        if (email) {
          this.profileService.getUserIdByEmail(email).subscribe({
            next: (res) => {
              if (res && res.data && res.data.user_id) {
                this.userSession.setUserId(res.data.user_id);
              }
            },
            error: (err) => {
              console.error('No se pudo obtener el id del usuario por email', err);
            }
          });
        }
      });
    }
  }
}