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
  private route = inject(ActivatedRoute);
  private subscription = new Subscription();

  activeTab: 'misJuegos' | 'misProgramaciones' = 'misJuegos';
  filtroSeleccionado: string = 'all';
  gameIdSeleccionado: number | null = null;
  isLoading: boolean = false;

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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeComponent(): void {
    if (this.userSessionService.isAuthenticated()) {
      this.isLoading = false;
    } else {
      this.subscription.add(
        this.userSessionService.waitForToken$(5000).subscribe({
          next: (token) => {
            this.isLoading = false;
          },
          error: (err) => {
            console.error('[Juegos] Error esperando token:', err);
            this.isLoading = false;
          }
        })
      );
    }
  }

  cambiarVista(tab: string) {
    this.activeTab = tab as 'misJuegos' | 'misProgramaciones';
    if (tab !== 'misProgramaciones') {
      this.gameIdSeleccionado = null;
    }
  }

  actualizarFiltro(filtro: string) {
    this.filtroSeleccionado = filtro;
  }
}
