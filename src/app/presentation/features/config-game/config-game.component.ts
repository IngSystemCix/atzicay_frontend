import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameInstanceService } from '../../../core/infrastructure/api/GameInstance/game-instance.service';
import { UserService } from '../../../core/infrastructure/api/user.service';
import { ConfigGame } from '../../../core/domain/interface/config-game';
import { ProgrammingGameConfig, ProgrammingGameService } from '../../../core/infrastructure/api/programming-game.service';

@Component({
  selector: 'app-config-game',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './config-game.component.html',
  styleUrl: './config-game.component.css'
})
export class ConfigGameComponent implements OnInit {
  gameId: number | null = null;

  config: ConfigGame = {
    nombre: '',
    intentos: 3,
    fechaInicio: '',
    fechaFin: '',
    tiempoMaximo: 120
  };

  isLoading = false;
  error = '';
  currentUserId: number | null = null;

  constructor(
    private programmingGameService: ProgrammingGameService,
    private gameInstanceService: GameInstanceService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = +params['id'];
    });
    this.getCurrentUser();
    this.setDefaultDates();
  }

  private getCurrentUser() {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userService.findUserByEmail(user.Email).subscribe({
        next: (response) => {
          this.currentUserId = response.data?.Id;
        },
        error: (err) => {
          console.error('Error al obtener usuario:', err);
        }
      });
    }
  }

  private setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.config.fechaInicio = today.toISOString().split('T')[0];
    this.config.fechaFin = tomorrow.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.gameId || !this.currentUserId) {
      this.error = 'Datos necesarios no disponibles';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const programmingConfig: ProgrammingGameConfig = {
      Name: this.config.nombre,
      Description: `Juego de programación configurado - ${this.config.nombre}`,
      Activated: true,
      settings: [
        {
          ConfigKey: "Filtros",
          ConfigValue: "Python, JavaScript"
        }
      ],
      ProgrammerId: this.currentUserId,
      ProgrammingGameName: this.config.nombre,
      StartTime: this.formatDateTime(this.config.fechaInicio, '09:00:00'),
      EndTime: this.formatDateTime(this.config.fechaFin, '17:00:00'),
      Attempts: this.config.intentos,
      MaximumTime: this.config.tiempoMaximo
    };

    this.programmingGameService.updateProgrammingGame(this.gameId, programmingConfig).subscribe({
      next: (response) => {
        console.log('Configuración guardada exitosamente:', response);
        this.isLoading = false;
        // Navegar de vuelta a la lista de juegos
        this.router.navigate(['/juegos']);
      },
      error: (err) => {
        console.error('Error al guardar configuración:', err);
        this.error = 'Error al guardar la configuración';
        this.isLoading = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.config.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return false;
    }

    if (!this.config.fechaInicio || !this.config.fechaFin) {
      this.error = 'Las fechas de inicio y fin son requeridas';
      return false;
    }

    if (new Date(this.config.fechaInicio) >= new Date(this.config.fechaFin)) {
      this.error = 'La fecha de fin debe ser posterior a la fecha de inicio';
      return false;
    }

    if (this.config.tiempoMaximo <= 0) {
      this.error = 'El tiempo máximo debe ser mayor a 0';
      return false;
    }

    return true;
  }

  private formatDateTime(date: string, time: string): string {
    return `${date}T${time}`;
  }

  cancelar() {
    this.router.navigate(['/juegos']);
  }
}