import { Component, Output, EventEmitter } from '@angular/core';

interface Tab {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-juegos-tabs',
  standalone: true,
  imports: [],
  templateUrl: './juegos-tabs.component.html',
  styleUrl: './juegos-tabs.component.css'
})
export class JuegosTabsComponent {
  tabActiva: string = 'misJuegos';
  totalJuegos: number = 8;

  tabs: Tab[] = [
    { id: 'misJuegos', nombre: 'Mis juegos' },
    { id: 'misProgramaciones', nombre: 'Mis Programaciones' }
  ];

  @Output() tabChanged = new EventEmitter<string>();

  cambiarTab(tab: string) {
    this.tabActiva = tab;
    this.tabChanged.emit(tab);
  }
}
