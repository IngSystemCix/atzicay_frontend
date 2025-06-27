import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
    MaximumTime: 1
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
      this.route.queryParams.subscribe(params => {
        this.nombreJuego = params['name'] || '';
        this.tipoJuego = params['type'] || '';
      })
    );
    
    // Usar el UserSessionService optimizado
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
            this.error = 'Error de autenticación. Por favor, recarga la página.';
          }
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

    // Mostrar en consola el JSON que se enviará
    console.log('Datos enviados:', JSON.stringify(data, null, 2));

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
            popup: 'animate__animated animate__fadeInUp animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutDown animate__faster'
          },
          customClass: {
            confirmButton: 'px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200'
          }
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

  cancelar() {
    this.router.navigate(['/juegos']);
  }
}
