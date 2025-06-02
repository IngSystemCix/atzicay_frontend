import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgrammingGameService } from '../../../../core/infrastructure/api/ProgrammingGame/programming-game.service';
import { ProgrammingGame } from '../../../../core/domain/model/programmingGame/programming-game';

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
export class MyProgrammingsComponent implements OnInit {

  activities: ActivityCard[] = [];

  constructor(private programmingGameService: ProgrammingGameService) {}


  ngOnInit() {
    this.programmingGameService.getAllProgrammingGames().subscribe({
      next: (games: ProgrammingGame[]) => {
        this.activities = games.map(game => ({
          id: game.Id,
          type: this.mapType(game.Name),
          title: game.Name,
          group: `Grupo ${game.ProgrammerId}`,
          status: game.Activated ? 'Activo' : 'Desactivado',
          difficulty: this.mapDifficulty(game.MaximumTime)
        }));
      },
      error: (err) => {
        console.error('Error al cargar programaciones:', err);
      }
    });
  }

  mapType(name: string): string {
    // Mapea el nombre del juego a un tipo si es necesario
    if (name.includes('Ahorcado')) return 'Ahorcado';
    if (name.includes('Rompecabezas')) return 'Rompecabezas';
    if (name.includes('Memoria')) return 'Memoria';
    if (name.includes('Pupiletras')) return 'Pupiletras';
    return 'Otro';
  }

  mapDifficulty(maxTime: number): 'basico' | 'intermedio' | 'dificil' {
    if (maxTime <= 60) return 'basico';
    if (maxTime <= 180) return 'intermedio';
    return 'dificil';
  }
  selectedTab: string = 'Todos';
  startDate: string = '';
  endDate: string = '';
  menuAbierto: number | null = null;

  tabs: string[] = ['Todos', 'Ahorcado', 'Rompecabezas', 'Memoria', 'Pupiletras'];

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
