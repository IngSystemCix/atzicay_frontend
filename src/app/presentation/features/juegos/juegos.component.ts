import { Component } from '@angular/core';
import {JuegosHeaderComponent} from '../../shared/games/juegos-header/juegos-header.component';
import {JuegosCategoriasComponent} from '../../shared/games/juegos-categorias/juegos-categorias.component';
import {JuegosTabsComponent} from '../../shared/games/juegos-tabs/juegos-tabs.component';
import {JuegosFiltrosComponent} from '../../shared/games/juegos-filtros/juegos-filtros.component';
import {JuegosListaComponent} from '../../shared/games/juegos-lista/juegos-lista.component';
import {VerMasButtonComponent} from '../../../shared/ver-mas-button/ver-mas-button.component';


@Component({
  selector: 'app-juegos',
  imports: [
    JuegosHeaderComponent,
    JuegosCategoriasComponent,
    JuegosTabsComponent,
    JuegosFiltrosComponent,
    JuegosListaComponent,
    VerMasButtonComponent
  ],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css'
})
export class JuegosComponent {

}
