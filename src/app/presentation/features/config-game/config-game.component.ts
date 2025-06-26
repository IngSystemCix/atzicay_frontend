import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { ProgrammingGameService } from '../../../core/infrastructure/api/programming-game.service';
import { UserSessionService } from '../../../core/infrastructure/service/user-session.service';
import { ProgrammingGame } from '../../../core/domain/model/programming-game.model';

@Component({
  selector: 'app-config-game',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './config-game.component.html',
  styleUrl: './config-game.component.css',
})
export class ConfigGameComponent implements OnInit {
  gameId: number | null = null;

  isLoading = false;
  error = '';
  currentUserId: number | null = null;

  programmingGame: ProgrammingGame = {
    Name: '',
    Activated: true,
    StartTime: '',
    EndTime: '',
    Attempts: 1,
    MaximumTime: 1
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programmingGameService: ProgrammingGameService,
    private userSession: UserSessionService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.gameId = +params['id'];
    });
    this.currentUserId = this.userSession.getUserId();
  }

  private formatDateTimeLocal(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  }

  onSubmit() {
    if (!this.gameId || !this.currentUserId) {
      this.error = 'No se encontró el usuario o el juego.';
      return;
    }
    // Validaciones frontend
    if (!this.programmingGame.Name || this.programmingGame.Name.trim().length === 0) {
      this.error = 'El nombre es obligatorio.';
      return;
    }
    if (!this.programmingGame.StartTime) {
      this.error = 'La fecha y hora de inicio es obligatoria.';
      return;
    }
    if (!this.programmingGame.EndTime) {
      this.error = 'La fecha y hora de fin es obligatoria.';
      return;
    }
    if (isNaN(this.programmingGame.Attempts) || this.programmingGame.Attempts < 1) {
      this.error = 'El número de intentos debe ser mayor o igual a 1.';
      return;
    }
    if (isNaN(this.programmingGame.MaximumTime) || this.programmingGame.MaximumTime < 1) {
      this.error = 'El tiempo máximo debe ser mayor o igual a 1 minuto.';
      return;
    }
    // Validar que la fecha de fin sea posterior a la de inicio
    if (this.programmingGame.StartTime && this.programmingGame.EndTime && this.programmingGame.StartTime >= this.programmingGame.EndTime) {
      this.error = 'La fecha de fin debe ser posterior a la de inicio.';
      return;
    }
    this.isLoading = true;
    this.error = '';
    // Formatear fechas a 'YYYY-MM-DD HH:mm:ss'
    const start = this.programmingGame.StartTime.replace('T', ' ') + ':00';
    const end = this.programmingGame.EndTime.replace('T', ' ') + ':00';
    const data: ProgrammingGame = {
      ...this.programmingGame,
      StartTime: start,
      EndTime: end,
      Attempts: Number(this.programmingGame.Attempts),
      MaximumTime: Number(this.programmingGame.MaximumTime)
    };
    this.programmingGameService
      .createProgrammingGame(this.gameId, this.currentUserId, data)
      .subscribe({
        next: () => {
          this.isLoading = false;
          Swal.fire(
            '¡Éxito!',
            'Programación creada correctamente',
            'success'
          ).then(() => {
            this.router.navigate(['/juegos']);
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Error al crear la programación';
        },
      });
  }

  private formatDateTime(date: string, time: string): string {
    return `${date}T${time}`;
  }

  cancelar() {
    this.router.navigate(['/juegos']);
  }
}
