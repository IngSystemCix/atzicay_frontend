import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ProgrammingGameService } from '../../../core/infrastructure/api/programming-game.service';
import { UserSessionService } from '../../../core/infrastructure/service/user-session.service';
import { ProgrammingGame } from '../../../core/domain/model/programming-game.model';
import { AtzicayButtonComponent } from '../../components/atzicay-button/atzicay-button.component';

@Component({
  selector: 'app-config-game',
  standalone: true,
  imports: [FormsModule, CommonModule, AtzicayButtonComponent],
  templateUrl: './config-game.component.html',
  styleUrl: './config-game.component.css',
})
export class ConfigGameComponent implements OnInit, OnDestroy {
  gameId: number | null = null;
  isLoading = false;
  error = '';
  currentUserId: number | null = null;
  nombreJuego: string = '';
  tipoJuego: string = '';
  private subscription = new Subscription();

  programmingGame: ProgrammingGame = {
    Name: '',
    Activated: true,
    StartTime: '',
    EndTime: '',
    Attempts: 1,
    MaximumTime: 1,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programmingGameService: ProgrammingGameService,
    private userSessionService: UserSessionService
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe((params) => {
        this.gameId = +params['id'];
      })
    );

    this.subscription.add(
      this.route.queryParams.subscribe((params) => {
        this.nombreJuego = params['name'] || '';
        this.tipoJuego = params['type'] || '';
      })
    );

    if (this.userSessionService.isAuthenticated()) {
      this.currentUserId = this.userSessionService.getUserId();
    } else {
      this.subscription.add(
        this.userSessionService.waitForToken$(3000).subscribe({
          next: () => {
            this.currentUserId = this.userSessionService.getUserId();
          },
          error: (err) => {
            console.error('[ConfigGame] Error esperando token:', err);
            this.error =
              'Error de autenticación. Por favor, recarga la página.';
          },
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    const now = new Date();
    const startTime = new Date(this.programmingGame.StartTime);
    const endTime = new Date(this.programmingGame.EndTime);

    // Validar nombre
    if (!this.programmingGame.Name || this.programmingGame.Name.trim().length === 0) {
      this.error = 'El nombre es obligatorio.';
      return;
    }
    // Validar fecha de inicio
    if (!this.programmingGame.StartTime) {
      this.error = 'La fecha y hora de inicio es obligatoria.';
      return;
    }
    if (isNaN(startTime.getTime()) || startTime < now) {
      this.error = 'La fecha y hora de inicio no puede ser anterior a la fecha actual.';
      return;
    }
    // Validar fecha de fin
    if (!this.programmingGame.EndTime) {
      this.error = 'La fecha y hora de fin es obligatoria.';
      return;
    }
    if (isNaN(endTime.getTime()) || endTime <= startTime) {
      this.error = 'La fecha de fin debe ser posterior a la de inicio.';
      return;
    }
    // Validar intentos
    const attempts = Number(this.programmingGame.Attempts);
    if (!Number.isInteger(attempts) || attempts < 1) {
      this.error = 'El número de intentos debe ser un número entero mayor o igual a 1.';
      return;
    }
    // Validar tiempo máximo
    const maxTime = Number(this.programmingGame.MaximumTime);
    if (!Number.isInteger(maxTime) || maxTime < 1) {
      this.error = 'El tiempo máximo debe ser un número entero mayor o igual a 1 minuto.';
      return;
    }
    // Validar que la fecha de fin sea posterior a la de inicio
    if (
      this.programmingGame.StartTime &&
      this.programmingGame.EndTime &&
      this.programmingGame.StartTime >= this.programmingGame.EndTime
    ) {
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
      MaximumTime: Number(this.programmingGame.MaximumTime),
    };

    
    

    this.programmingGameService
      .createProgrammingGame(this.gameId, this.currentUserId, data)
      .subscribe({
        next: () => {
          this.isLoading = false;

          // SweetAlert2 mejorado con información del juego
          Swal.fire({
            title: '¡Programación Exitosa!',
            html: `
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 3rem; margin-bottom: 15px;">
                ${this.getGameIcon(this.tipoJuego)}
              </div>
              <h3 style="color: #4a5568; margin-bottom: 10px; font-weight: 600;">
                ${this.nombreJuego || 'Juego'}
              </h3>
              <p style="color: #718096; margin-bottom: 15px;">
                <strong>Tipo:</strong> ${this.tipoJuego || 'No especificado'}
              </p>
              <p style="color: #718096; margin-bottom: 5px;">
                <strong>Programación:</strong> ${this.programmingGame.Name}
              </p>
              <p style="color: #718096; font-size: 0.9rem;">
                La programación ha sido creada correctamente y está lista para usar.
              </p>
            </div>
          `,
            icon: 'success',
            confirmButtonText: 'Ir a Mis Juegos',
            confirmButtonColor: '#8571FB',
            showClass: {
              popup: 'animate__animated animate__fadeInUp animate__faster',
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutDown animate__faster',
            },
            customClass: {
              confirmButton:
                'px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200',
            },
          }).then(() => {
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


  getMinDateTime(): string {
    const now = new Date();
    // Restar la diferencia horaria para obtener la hora local
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  }

   isEndDateBeforeStart(): boolean {
    if (!this.programmingGame.StartTime || !this.programmingGame.EndTime) {
      return false;
    }
    return new Date(this.programmingGame.EndTime) <= new Date(this.programmingGame.StartTime);
  }
   getTipoJuegoLabel(type: string): string {
    const labelMap: { [key: string]: string } = {
      hangman: 'Ahorcado',       
      memory: 'Juego de Memoria',         
      puzzle: 'Rompecabezas',        
      solve_the_word: 'Resolver Palabra', 
      all: 'Todos los juegos',          
    };
    return labelMap[type] || type;
  }

  getGameIcon(type: string): string {
    const iconoMap: { [key: string]: string } = {
      hangman: '🎯',
      memory: '🧠',
      puzzle: '🧩',
      solve_the_word: '📝',
      all: '🎮',
    };
    return iconoMap[type] || '🎮';
  }

  // Actualiza EndTime automáticamente cuando cambia StartTime
  onStartTimeChange(): void {
    if (this.programmingGame.StartTime) {
      const startDate = new Date(this.programmingGame.StartTime);
      // Sumar 24 horas
      startDate.setHours(startDate.getHours() + 24);
      // Formatear a string compatible con input datetime-local
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const hours = String(startDate.getHours()).padStart(2, '0');
      const minutes = String(startDate.getMinutes()).padStart(2, '0');
      this.programmingGame.EndTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  }

  cancelar() {
    this.router.navigate(['/juegos']);
  }
}
