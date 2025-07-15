import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  HostListener,
  OnDestroy,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, Subscription, filter, take } from 'rxjs';
import { AuthService } from '../../../core/infrastructure/api/auth.service';
import { GameInstance } from '../../../core/domain/model/game-instance.model';
import { AtzicayButtonComponent } from '../../components/atzicay-button/atzicay-button.component';
import { FilterDropdownComponent } from '../../components/filter-dropdown/filter-dropdown.component';
import { GameInstanceService } from '../../../core/infrastructure/api/game-instance.service';
import { UserSessionService } from '../../../core/infrastructure/service/user-session.service';
import { GameLoadingService } from '../../../core/infrastructure/service/game-loading.service';
import { RedirectService } from '../../../core/infrastructure/service/RedirectService.service';
import { CacheBustingService } from '../../../core/infrastructure/service/cache-busting.service';
import { SmartImageDirective } from '../../directives/smart-image.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, AtzicayButtonComponent, FilterDropdownComponent, SmartImageDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private gameInstanceService = inject(GameInstanceService);
  private userSessionService = inject(UserSessionService);
  private gameLoadingService = inject(GameLoadingService);
  private cacheBustingService = inject(CacheBustingService);
  protected PAGE_SIZE = 6;
  private auth0 = inject(Auth0Service);
  private backendAuthService = inject(AuthService);
  private redirectService = inject(RedirectService);
  private router = inject(Router);
  private subscription = new Subscription();


  // Variables para el scroll header
  headerVisible = true;
  private lastScrollTop = 0;
  private mainScrollElement: HTMLElement | null = null;
  private scrollHandler = this.onMainScroll.bind(this);

  isDropdownOpen = false;
  activeDropdownId: number | null = null;
  ratingArray: number[] = [1, 2, 3, 4, 5];
  isLoadingMore: boolean = false;
  getGameRoute(gameType: string, id: number): string {
    const normalizedType = gameType.replace(/\s|_/g, '').toLowerCase();
    switch (normalizedType) {
      case 'hangman':
        return `/juegos/jugar-hangman/${id}`;
      case 'puzzle':
        return `/juegos/jugar-puzzle/${id}`;
      case 'memory':
        return `/juegos/jugar-memory/${id}`;
      case 'solvetheword':
        return `/juegos/jugar-solve-the-word/${id}`;
      default:
        return '/juegos';
    }
  }

  private limitSubject = new BehaviorSubject<{ limit: number }>({ limit: 6 });
  
  ngOnInit(): void {
    // Optimizado: Cargar juegos inmediatamente y manejar redirección en paralelo
    this.loadGameInstances();
    
    // Manejar redirección en paralelo si es necesario
    this.userSessionService.userId$.pipe(
      filter(userId => !!userId),
      take(1)
    ).subscribe(() => {
      try {
        const returnUrl = this.redirectService.getReturnUrl();
        if (returnUrl) {
          // Redirigir pero permitir que el dashboard se cargue primero
          setTimeout(() => {
            this.redirectService.redirectAfterLogin();
          }, 100);
        }
      } catch (error) {
        console.warn('RedirectService not available or error:', error);
        // Continuar normalmente si hay error con redirect service
      }
    });
  }
getTypeIcon(typeValue: string): string {
  const icons: { [key: string]: string } = {
    'all': '🎮',
    'hangman': '🎯',
    'memory': '🧠',
    'puzzle': '🧩',
    'solve_theword': '📝'
  };
  return icons[typeValue] || '🎮';
}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.mainScrollElement) {
      this.mainScrollElement.removeEventListener('scroll', this.scrollHandler);
    }
  }

  ngAfterViewInit(): void {
    // Find the main content area in the main layout
    setTimeout(() => {
      this.mainScrollElement = document.querySelector('main.flex-1.w-full.overflow-auto');
      if (this.mainScrollElement) {
        this.mainScrollElement.addEventListener('scroll', this.scrollHandler, { passive: true });
      }
    }, 0);
  }

  private onMainScroll(): void {
    if (!this.mainScrollElement) return;
    const scrollTop = this.mainScrollElement.scrollTop;
    if (scrollTop === 0) {
      this.headerVisible = true;
    } else {
      this.headerVisible = false;
    }
    this.lastScrollTop = scrollTop;
  }

  private loadGameInstances(): void {
    // Solo actualizar cache version en la primera carga
    const isFirstLoad = this.allGames.length === 0;
    
    if (isFirstLoad) {
      this.cacheBustingService.updateCacheVersion();
      this.gameLoadingService.showFastGameLoading('Cargando juegos...');
    }
    
    this.gameInstanceService
      .getGameInstances(this.searchTerm, this.selectedType || undefined, this.PAGE_SIZE, 0)
      .subscribe({
        next: (response) => {
          const games = response.data.data;
          this.allGames = games;
          this.filteredGames = games;
          this.displayedGames = games.slice(0, this.PAGE_SIZE);
          this.currentOffset = games.length;
          this.hasMoreGames = games.length === this.PAGE_SIZE;
          
          if (isFirstLoad) {
            this.gameLoadingService.hideFast();
          }
        },
        error: (err) => {
          console.error('Error cargando instancias de juegos:', err);
          this.allGames = [];
          this.filteredGames = [];
          this.displayedGames = [];
          
          if (isFirstLoad) {
            this.gameLoadingService.hideFast();
          }
        },
      });
  }

  currentPage = 1;
  searchTerm = '';
  selectedType: string | null = null;
  selectedLevels: string[] = [];

  gameTypes = [
    { value: 'hangman', label: 'Ahorcado' },
    { value: 'puzzle', label: 'Rompecabezas' },
    { value: 'memory', label: 'Memoria' },
    { value: 'solve_the_word', label: 'Pupiletras' },
  ];

  difficultyLevels = [
    { value: 'E', label: 'Fácil' },
    { value: 'M', label: 'Medio' },
    { value: 'D', label: 'Difícil' },
  ];

  allGames: GameInstance[] = [];
  filteredGames: GameInstance[] = [];
  displayedGames: GameInstance[] = [];

  toggleTypeFilter(type: string): void {
    if (this.selectedType === type) {
      this.selectedType = null;
    } else {
      this.selectedType = type;
    }
    this.applyFilters();
  }

  removeTypeFilter(type: string): void {
    if (this.selectedType === type) {
      this.selectedType = null;
      this.applyFilters();
    }
  }

  toggleLevelFilter(level: string): void {
    const index = this.selectedLevels.indexOf(level);
    if (index === -1) {
      this.selectedLevels.push(level);
    } else {
      this.selectedLevels.splice(index, 1);
    }
    this.applyFilters();
  }

  removeLevelFilter(level: string): void {
    this.selectedLevels = this.selectedLevels.filter((l) => l !== level);
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedType = null;
    this.selectedLevels = [];
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Método optimizado para aplicar filtros sin bloquear la UI
   */
  applyFilters(): void {
    this.currentPage = 1;
    // Solo cargar instancias sin forzar cache refresh
    this.loadGameInstances();
  }

  loadMoreGames(): void {
    if (!this.hasMoreGames || this.isLoadingMore) return;

    this.isLoadingMore = true;
    const newLimit = this.PAGE_SIZE + 6;

    this.gameInstanceService
      .getGameInstances(this.searchTerm, this.selectedType || undefined, newLimit, 0)
      .subscribe({
        next: (response) => {
          if (response.data.data.length > this.allGames.length) {
            this.allGames = response.data.data;
            this.filteredGames = response.data.data;
            this.displayedGames = response.data.data.slice(0, newLimit);
            this.currentOffset = this.allGames.length;
            this.hasMoreGames = this.allGames.length === newLimit;
            this.PAGE_SIZE = newLimit;
          } else {
            this.hasMoreGames = false;
          }
          this.isLoadingMore = false;
        },
        error: (err) => {
          console.error('Error cargando más instancias de juegos:', err);
          this.isLoadingMore = false;
        },
      });
  }

  getLevelClasses(level: string): string {
    switch (level.toLowerCase()) {
      case 'e':
        return 'bg-[#C9FFD0] text-green-800';
      case 'm':
        return 'bg-[#FFFEC2] text-yellow-800';
      case 'h':
        return 'bg-[#FFB4B4] text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }

  getLevelText(level: string): string {
    switch (level) {
      case 'E':
        return 'Fácil';
      case 'M':
        return 'Intermedio';
      case 'H':
        return 'Difícil';
      default:
        return 'Desconocido';
    }
  }

  dropdownToggle(gameId: number) {
  
    if (this.activeDropdownId === gameId) {
      this.activeDropdownId = null;
    } else {
      this.activeDropdownId = gameId;
    }
  }

  isDropdownActive(gameId: number): boolean {
    const isActive = this.activeDropdownId === gameId;
    return isActive;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownElement = target.closest('.game-card-dropdown');
    const buttonElement = target.closest('button[title="Opciones del juego"]');
    
    // Si el clic no fue en un dropdown ni en un botón de opciones, cerrar todos los dropdowns
    if (!dropdownElement && !buttonElement) {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    this.activeDropdownId = null;
  }

  getTypeLabel(typeValue: string): string {
    const type = this.gameTypes.find((t) => t.value === typeValue);
    return type ? type.label : typeValue;
  }

  getLevelLabel(levelValue: string): string {
    const level = this.difficultyLevels.find((l) => l.value === levelValue);
    return level ? level.label : levelValue;
  }

  // Métodos para el FilterDropdownComponent
  onSelectedTypeChange(selectedType: string | null): void {
    this.selectedType = selectedType;
    this.applyFilters();
  }

  onFilterDropdownClosed(): void {
    // Método llamado cuando se cierra el dropdown
    // Aquí puedes agregar lógica adicional si es necesario
  }
  totalGamesInDB = 0;
  currentOffset = 0;
  hasMoreGames = true;

  onChangeLimit(newLimit: number) {
    this.PAGE_SIZE = newLimit;
    this.currentOffset = 0;
    this.allGames = [];
    this.hasMoreGames = true;
    this.limitSubject.next({
      limit: this.PAGE_SIZE,
    });
  }

  get totalGames(): number {
    return this.filteredGames.length;
  }

  getGameImage(type: string): string {
    const imagePath = this.getGameImagePath(type);
    
    // Para imágenes de assets estáticas, usar cache busting normal
    const imageWithCache = this.cacheBustingService.applyCacheBusting(imagePath);
    
    // Si estamos en desarrollo, forzar refresh del dev server ocasionalmente
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Solo forzar refresh si han pasado más de 5 segundos desde la última vez
      const now = Date.now();
      const lastRefresh = parseInt(sessionStorage.getItem('last_dev_refresh') || '0');
      
      if (now - lastRefresh > 5000) {
        this.cacheBustingService.forceDevServerRefresh();
        sessionStorage.setItem('last_dev_refresh', now.toString());
      }
    }
    
    return imageWithCache;
  }

  getGameImagePath(type: string): string {
    switch (type) {
      case 'hangman':
        return 'assets/ahorcado.png';
      case 'memory':
        return 'assets/memoria.png';
      case 'puzzle':
        return 'assets/rompecabezas.png';
      case 'solve_the_word':
        return 'assets/pupiletras.png';
      default:
        return 'assets/default-game.png';
    }
  }

  getGameBackgroundColor(type: string): string {
    switch (type) {
      case 'hangman':
        return '#3DCE89'; // Verde del ahorcado
      case 'memory':
        return '#DBA25F'; // Naranja del memory
      case 'solve_the_word':
        return '#C45C5B'; // Rojo del pupiletras
      case 'puzzle':
        return '#3399D1'; // Azul del rompecabezas
      default:
        return '#94A3B8'; // Gris por defecto
    }
  }

  private searchTimeout: any;

  onSearchTermChange(): void {
    // Limpiar timeout anterior si existe
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Crear nuevo timeout para debounce
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 500); // 500ms de delay
  }

  trackByTypeValue(_index: number, type: { value: string; label: string }) {
    return type.value;
  }

  filterByAuthor(author: string): void {
    this.searchTerm = author;
    this.selectedType = null; 
    this.selectedLevels = []; 
    this.applyFilters(); 
  
    const scrollElement = document.querySelector('.dashboard-scroll-content');
    if (scrollElement) {
      scrollElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Fuerza la actualización del cache de imágenes
   * Útil cuando se crean nuevos juegos o se actualizan imágenes
   */
  refreshImageCache(): void {
    this.cacheBustingService.updateCacheVersion();
    console.log('Cache de imágenes actualizado para mejor rendimiento');
  }

  /**
   * Método optimizado para aplicar filtros sin bloquear la UI
   */
  optimizedApplyFilters(): void {
    this.currentPage = 1;
    this.isLoadingMore = false; // Asegurarse de que no esté en estado de carga más
    this.loadGameInstances();
  }

  /**
   * Método optimizado para navegar a un juego con cache fresco
   */
  playGame(gameType: string, id: number): void {
    // En desarrollo, forzar la detección de nuevos assets
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      this.cacheBustingService.triggerDevServerAssetScan();
      this.cacheBustingService.forceDevRecompilation();
    }
    
    // Obtener la ruta del juego
    const route = this.getGameRoute(gameType, id);
    
    // Navegar con un pequeño delay para dar tiempo al cache
    setTimeout(() => {
      this.router.navigateByUrl(route);
    }, 150);
  }

  /**
   * Fuerza la recarga de assets en el servidor de desarrollo
   */
  private forceAssetReload(imagePath: string): void {
    // Solo ejecutar en desarrollo
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Crear una imagen temporal para forzar la carga
      const img = new Image();
      img.onload = () => {
        // Imagen cargada correctamente
        console.log('Asset reloaded successfully:', imagePath);
      };
      img.onerror = () => {
        // Si falla, intentar recargar después de un pequeño delay
        setTimeout(() => {
          this.retryImageLoad(imagePath);
        }, 1000);
      };
      img.src = imagePath;
    }
  }

  /**
   * Reintenta cargar una imagen con cache busting más agresivo
   */
  private retryImageLoad(originalPath: string): void {
    // Generar nuevo timestamp para cache busting más agresivo
    const timestamp = Date.now();
    const separator = originalPath.includes('?') ? '&' : '?';
    const retryPath = `${originalPath}${separator}_retry=${timestamp}`;
    
    const img = new Image();
    img.onload = () => {
      console.log('Image retry successful:', retryPath);
      // Forzar actualización de la vista
      this.forceChangeDetection();
    };
    img.onerror = () => {
      console.warn('Image retry failed:', retryPath);
    };
    img.src = retryPath;
  }

  /**
   * Fuerza la detección de cambios en Angular
   */
  private forceChangeDetection(): void {
    // Triggear change detection para actualizar las imágenes en la vista
    setTimeout(() => {
      // Pequeño cambio para triggear change detection
      this.lastImageUpdate = Date.now();
    }, 100);
  }

  // Variable para triggear change detection
  lastImageUpdate = 0;

  /**
   * Método para llamar después de crear un nuevo juego
   * Fuerza la actualización completa del dashboard para detectar nuevas imágenes
   */
  refreshAfterGameCreation(): void {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // Forzar recompilación del dev server
      this.cacheBustingService.forceDevRecompilation();
      
      // Triggear scan de assets
      this.cacheBustingService.triggerDevServerAssetScan();
      
      // Esperar un poco y recargar los juegos
      setTimeout(() => {
        this.loadGameInstances();
      }, 1000);
      
      console.log('Dashboard refreshed after game creation');
    } else {
      // En producción, solo recargar normalmente
      this.cacheBustingService.updateCacheVersion();
      this.loadGameInstances();
    }
  }
}
