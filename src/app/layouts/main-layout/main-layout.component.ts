import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../presentation';
import { SidebarComponent } from '../../presentation';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../core/infrastructure/api/sidebar/sidebar.service';

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
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    // Verificar tamaño de pantalla inicial
    this.checkScreenSize();
    
    // En móvil, iniciar con sidebar colapsado
    if (this.isMobile) {
      this.sidebarCollapsed = true;
      // Opcional: actualizar el servicio también
      this.sidebarService.setSidebarState(true);
    }

    // Suscribirse a cambios del sidebar
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.sidebarCollapsed = collapsed;
      })
    );
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
}