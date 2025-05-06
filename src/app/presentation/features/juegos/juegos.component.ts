import { Component } from '@angular/core';
import {JuegosHeaderComponent} from '../../shared/my-games/juegos-header/juegos-header.component';
import {JuegosCategoriasComponent} from '../../shared/my-games/juegos-categorias/juegos-categorias.component';
import {JuegosTabsComponent} from '../../shared/my-games/juegos-tabs/juegos-tabs.component';
import {JuegosFiltrosComponent} from '../../shared/my-games/juegos-filtros/juegos-filtros.component';
import {JuegosListaComponent} from '../../shared/my-games/juegos-lista/juegos-lista.component';
import {MyProgrammingsComponent} from '../../shared/my-games/my-programmings/my-programmings.component';


@Component({
  selector: 'app-juegos',
  imports: [
    JuegosHeaderComponent,
    JuegosCategoriasComponent,
    JuegosTabsComponent,
    JuegosFiltrosComponent,
    JuegosListaComponent,
    MyProgrammingsComponent
  ],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css'
})
export class JuegosComponent {
  activeTab: 'misJuegos' | 'misProgramaciones' = 'misJuegos';
  filtroSeleccionado: string = 'Todos';

  cambiarVista(tab: string) {
    this.activeTab = tab as 'misJuegos' | 'misProgramaciones';
  }

  actualizarFiltro(filtro: string) {
    this.filtroSeleccionado = filtro;
  }

}
