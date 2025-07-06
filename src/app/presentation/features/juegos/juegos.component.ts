import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { JuegosHeaderComponent } from '../../shared/my-games/juegos-header/juegos-header.component';
import { JuegosCategoriasComponent } from '../../shared/my-games/juegos-categorias/juegos-categorias.component';
import { JuegosTabsComponent } from '../../shared/my-games/juegos-tabs/juegos-tabs.component';
import { JuegosListaComponent } from '../../shared/my-games/juegos-lista/juegos-lista.component';
import { MyProgrammingsComponent } from '../../shared/my-games/my-programmings/my-programmings.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AtzicayTabsComponent, Tab as AtzicayTab } from '../../components/atzicay-tabs/atzicay-tabs.component';
import { UserSessionService } from '../../../core/infrastructure/service/user-session.service';
import { GameLoadingService } from '../../../core/infrastructure/service/game-loading.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-juegos',
  imports: [
    HttpClientModule,
    JuegosHeaderComponent,
    JuegosCategoriasComponent,
    JuegosTabsComponent,
    JuegosListaComponent,
    MyProgrammingsComponent,
    CommonModule,
    AtzicayTabsComponent, 
  ],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css',
})
export class JuegosComponent implements OnInit, OnDestroy {
  private userSessionService = inject(UserSessionService);
  private gameLoadingService = inject(GameLoadingService);
  private route = inject(ActivatedRoute);
  private subscription = new Subscription();

  activeTab: 'misJuegos' | 'misProgramaciones' = 'misJuegos';
  filtroSeleccionado: string = 'all';
  gameIdSeleccionado: number | null = null;
  mobileFiltersOpen: boolean = false;

  filtroTabs: AtzicayTab<string>[] = [
    { id: 'all', label: 'Todos' },
    { id: 'hangman', label: 'Ahorcado' },
    { id: 'puzzle', label: 'Rompecabezas' },
    { id: 'memory', label: 'Memoria' },
    { id: 'solve_the_word', label: 'Pupiletras' },
  ];

  ngOnInit() {
    this.initializeComponent();
    
    // Escuchar cambios en los query parameters
    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        if (params['gameId']) {
          this.gameIdSeleccionado = +params['gameId'];
          this.activeTab = 'misProgramaciones';
        }
      })
    );

    // Cerrar dropdown móvil al hacer click fuera
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    document.removeEventListener('click', this.handleClickOutside.bind(this));
    // Asegurar que se oculte cualquier loading al salir del componente
    this.gameLoadingService.hideFast();
  }

  private async initializeComponent(): Promise<void> {
    try {
      // Mostrar loading rápido al entrar a la sección de juegos
      this.gameLoadingService.showFastGameLoading('Cargando juegos...');
      
      // Verificar autenticación con loading optimizado
      if (this.userSessionService.isAuthenticated()) {
        // Usuario ya autenticado, ocultar loading inmediatamente
        this.gameLoadingService.hideFast();
      } else {
        // Esperar token con loading descriptivo
        await this.gameLoadingService.loadGameData(
          async () => {
            return new Promise<void>((resolve, reject) => {
              this.subscription.add(
                this.userSessionService.waitForToken$(3000).subscribe({
                  next: (token) => {
                    resolve();
                  },
                  error: (err) => {
                    console.error('[Juegos] Error esperando token:', err);
                    // No rechazar, permitir continuar sin token
                    resolve();
                  }
                })
              );
            });
          },
          'auth'
        );
      }
    } catch (error) {
      console.error('[Juegos] Error inicializando:', error);
      // Ocultar loading en caso de error
      this.gameLoadingService.hideFast();
    }
  }

  cambiarVista(tab: string) {
    // Para cambios de vista rápidos, mostrar feedback mínimo si es necesario
    if (tab !== this.activeTab) {
      this.activeTab = tab as 'misJuegos' | 'misProgramaciones';
      if (tab !== 'misProgramaciones') {
        this.gameIdSeleccionado = null;
      }
      
      // Opcional: Loading muy rápido solo para cambios de vista complejos
      if (tab === 'misProgramaciones' && this.gameIdSeleccionado) {
        this.gameLoadingService.showFastGameLoading('Cargando programaciones...');
        // Se ocultará automáticamente cuando el componente cargue
        setTimeout(() => this.gameLoadingService.hideFast(), 200);
      }
    }
  }

  actualizarFiltro(filtro: string) {
    if (filtro !== this.filtroSeleccionado) {
      this.filtroSeleccionado = filtro;
      // Los filtros son instantáneos, no necesitan loading
    }
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  selectMobileFilter(filtroId: string) {
    this.filtroSeleccionado = filtroId;
    this.mobileFiltersOpen = false;
  }

  getCurrentFilterLabel(): string {
    const currentFilter = this.filtroTabs.find(tab => tab.id === this.filtroSeleccionado);
    return currentFilter ? currentFilter.label : 'Todos';
  }

  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.mobileFiltersOpen = false;
    }
  }
}
