import {Component, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ActivityCard {
  id: number;
  type: string;
  title: string;
  group: string;
  status: 'Activo' | 'Desactivado';
  difficulty: 'basico' | 'intermedio' | 'dificil';
}

@Component({
  selector: 'app-my-programmings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-programmings.component.html',
  styleUrl: './my-programmings.component.css'
})
export class MyProgrammingsComponent {
  selectedTab: string = 'Todos';
  startDate: string = '';
  endDate: string = '';
  menuAbierto: number | null = null;

  tabs: string[] = ['Todos', 'Ahorcado', 'Rompecabezas', 'Memoria', 'Pupiletras'];

  activities: ActivityCard[] = [
    {
      id: 1,
      type: 'Ahorcado',
      title: 'Animales',
      group: '4TO A',
      status: 'Activo',
      difficulty: 'basico'
    },
    {
      id: 2,
      type: 'Rompecabezas',
      title: 'Sistema Solar',
      group: '4TO A',
      status: 'Activo',
      difficulty: 'intermedio'
    },
    {
      id: 3,
      type: 'Memoria',
      title: 'Capitales del Mundo',
      group: '4TO A',
      status: 'Desactivado',
      difficulty: 'dificil'
    }
  ];

  getDifficultyClass(difficulty: string): string {
    switch(difficulty) {
      case 'basico': return 'bg-[#C9FFD0]';
      case 'intermedio': return 'bg-[#FFFEC2]';
      case 'dificil': return 'bg-[#FFB4B4]';
      default: return '';
    }
  }

  getTypeIcon(type: string): string {
    switch(type) {
      case 'Ahorcado': return '🎯';
      case 'Rompecabezas': return '🧩';
      case 'Memoria': return '🃏';
      case 'Pupiletras': return '📝';
      default: return '📚';
    }
  }

  getFilteredActivities() {
    if (this.selectedTab === 'Todos') {
      return this.activities;
    }
    return this.activities.filter(activity => activity.type === this.selectedTab);
  }

  editarActividad(id: number) {
    console.log('Editar actividad', id);
  }

  showOptions(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.menuAbierto = this.menuAbierto === id ? null : id;
  }

  eliminarActividad(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      console.log(`Eliminar actividad con ID: ${id}`);
    }
  }
  verReporte(id: number): void {
    console.log(`Ver reporte de la actividad con ID: ${id}`);
  }



}
