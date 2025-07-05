import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
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
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  isMobile = false;
  isTablet = false;
  isDesktop = false;

  private sidebarService = inject(SidebarService);
  private auth0 = inject(Auth0Service);
  private profileService = inject(ProfileService);
  private userSession = inject(UserSessionService);
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.checkScreenSize();
    this.initializeSidebarState();

    if (this.isMobile) {
      this.sidebarCollapsed = true;
      this.sidebarService.setSidebarState(true);
    }

    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe((collapsed) => {
        this.sidebarCollapsed = collapsed;
      })
    );

    this.subscription.add(
      this.userSession.waitForToken$(5000).subscribe({
        next: (token) => {
          this.ensureUserIdLoaded();
        },
        error: (err) => {
          console.error('[MainLayout] Error esperando token:', err);
          // Intentar cargar usuario de todas formas
          this.ensureUserIdLoaded();
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
    this.updateSidebarForDevice();

    // Auto-colapsar en móvil
    if (this.isMobile && !this.sidebarCollapsed) {
      this.toggleSidebar();
    }
  }

  private checkScreenSize(): void {
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      this.isMobile = true;
      this.isTablet = false;
      this.isDesktop = false;
    } else if (screenWidth >= 768 && screenWidth < 1024) {
      this.isMobile = false;
      this.isTablet = true;
      this.isDesktop = false;
    } else {
      this.isMobile = false;
      this.isTablet = false;
      this.isDesktop = true;
    }
  }

  private initializeSidebarState(): void {
    if (this.isMobile || this.isTablet) {
      this.sidebarCollapsed = true;
      this.sidebarService.setSidebarState(true);
    } else {
      const savedState = this.getSavedSidebarState();
      this.sidebarCollapsed = savedState;
      this.sidebarService.setSidebarState(savedState);
    }
  }

  private updateSidebarForDevice(): void {
    if (this.isMobile || this.isTablet) {
      if (!this.sidebarCollapsed) {
        this.sidebarService.setSidebarState(true);
      }
    } else if (this.isDesktop) {
      const savedState = this.getSavedSidebarState();
      this.sidebarService.setSidebarState(savedState);
    }
  }

  private getSavedSidebarState(): boolean {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  }

  private saveSidebarState(): void {
    if (this.isDesktop) {
      localStorage.setItem(
        'sidebarCollapsed',
        JSON.stringify(this.sidebarCollapsed)
      );
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
    this.saveSidebarState();
  }

  // Método para cerrar sidebar en móvil (útil para llamar desde el template)
  closeSidebarOnMobile(): void {
    if ((this.isMobile || this.isTablet) && !this.sidebarCollapsed) {
      this.sidebarService.setSidebarState(true);
    }
  }

  onOverlayClick(): void {
    if (this.isMobile || this.isTablet) {
      this.sidebarService.setSidebarState(true);
    }
  }

  private ensureUserIdLoaded() {
    const userId = this.userSession.getUserId();
    if (!userId) {
      this.subscription.add(
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
                console.error(
                  'No se pudo obtener el id del usuario por email',
                  err
                );
              },
            });
          }
        })
      );
    } else {
    }
  }
}
