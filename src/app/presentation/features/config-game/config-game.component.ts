import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/infrastructure/api/user.service';
import { ConfigGame } from '../../../core/domain/interface/config-game';
import {
  ProgrammingGameConfig,
  ProgrammingGameService,
} from '../../../core/infrastructure/api/programming-game.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-config-game',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './config-game.component.html',
  styleUrl: './config-game.component.css',
})
export class ConfigGameComponent implements OnInit {
  gameId: number | null = null;

  config: ConfigGame = {
    nombre: '',
    intentos: 3,
    fechaInicio: '',
    fechaFin: '',
    tiempoMaximo: 120,
  };

  isLoading = false;
  error = '';
  currentUserId: number | null = null;

  constructor(
    private programmingGameService: ProgrammingGameService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
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
        },
      });
    }
  }

  private setDefaultDates() {
    const now = new Date();
    const later = new Date(now);
    later.setHours(later.getHours() + 1); // una hora después

    this.config.fechaInicio = this.formatDateTimeLocal(now);
    this.config.fechaFin = this.formatDateTimeLocal(later);
  }

  private formatDateTimeLocal(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  }

  onSubmit() {
    // Validar que fecha de inicio < fecha de fin
    if (new Date(this.config.fechaInicio) >= new Date(this.config.fechaFin)) {
      this.error = 'La fecha y hora de fin debe ser posterior a la de inicio';
      return;
    }

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
      ProgrammerId: this.currentUserId,
      ProgrammingGameName: this.config.nombre,
      StartTime: this.config.fechaInicio,
      EndTime: this.config.fechaFin,
      Attempts: this.config.intentos,
      MaximumTime: this.config.tiempoMaximo,
    };

    this.programmingGameService
      .updateProgrammingGame(this.gameId, programmingConfig)
      .subscribe({
        next: (response) => {
          console.log('Configuración guardada exitosamente:', response);
          this.isLoading = false;

          Swal.fire({
            title: '¡Éxito!',
            text: 'La programación del juego se ha creado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.router.navigate(['/juegos']);
          });
        },
        error: (err) => {
          console.error('Error al guardar configuración:', err);
          this.error = 'Error al guardar la configuración';
          this.isLoading = false;
        },
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
