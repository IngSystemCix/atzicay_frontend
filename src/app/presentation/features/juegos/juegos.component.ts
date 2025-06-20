import { Component, OnInit } from '@angular/core';
import { JuegosHeaderComponent } from '../../shared/my-games/juegos-header/juegos-header.component';
import { JuegosCategoriasComponent } from '../../shared/my-games/juegos-categorias/juegos-categorias.component';
import { JuegosTabsComponent } from '../../shared/my-games/juegos-tabs/juegos-tabs.component';
import { JuegosListaComponent } from '../../shared/my-games/juegos-lista/juegos-lista.component';
import { MyProgrammingsComponent } from '../../shared/my-games/my-programmings/my-programmings.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-juegos',
  imports: [
    HttpClientModule,
    JuegosHeaderComponent,
    JuegosCategoriasComponent,
    JuegosTabsComponent,
    JuegosListaComponent,
    MyProgrammingsComponent,
  ],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css',
})
export class JuegosComponent implements OnInit {
  activeTab: 'misJuegos' | 'misProgramaciones' = 'misJuegos';
  filtroSeleccionado: string = 'Todos';
  gameIdSeleccionado: number | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Escuchar cambios en los query parameters
    this.route.queryParams.subscribe((params) => {
      if (params['gameId']) {
        this.gameIdSeleccionado = +params['gameId'];
        this.activeTab = 'misProgramaciones';
      }
    });
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
