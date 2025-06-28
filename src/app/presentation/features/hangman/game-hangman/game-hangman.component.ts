import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import {
  GameConfiguration,
  HangmanWord,
} from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { RatingModalComponent } from '../../../shared/rating-modal/rating-modal.component';
import { RatingService } from '../../../../core/infrastructure/service/rating.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

interface JuegoState {
  palabraActual: string;
  pistaPalabra: string;
  palabraRevelada: string[];
  letrasSeleccionadas: Set<string>;
  intentosRestantes: number;
  vidasRestantes: number;
  tiempoRestante: number;
  tiempoInicial: number;
  juegoTerminado: boolean;
  juegoGanado: boolean;
  juegoFinalizado: boolean;
  timerInterval: any;
  // Configuración del juego
  gameConfig: GameConfiguration | null;
  mensajeExito: string;
  mensajeFallo: string;
  colorFondo: string;
  colorTexto: string;
  fuente: string;
  cargando: boolean;
  error: string;
  palabrasJuego: HangmanWord[];
  indicePalabraActual: number;
  palabrasCompletadas: number;
  totalPalabras: number;
  contadorCambio: number;
  intervaloContador: any;
}

@Component({
  selector: 'app-game-hangman',
  standalone: true,
  imports: [CommonModule, RatingModalComponent],
  templateUrl: './game-hangman.component.html',
  styleUrls: ['./game-hangman.component.css'],
})
export class GameHangmanComponent
  extends BaseAuthenticatedComponent
  implements OnInit, OnDestroy
{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameConfigService = inject(GameConfigurationService);
  private ratingService = inject(RatingService);

  readonly INTENTOS_INICIALES = 6;
  private intervaloContador: any;

  state: JuegoState = {
    palabraActual: '',
    pistaPalabra: '',
    palabraRevelada: [],
    letrasSeleccionadas: new Set<string>(),
    intentosRestantes: 6,
    vidasRestantes: 3,
    tiempoRestante: 180,
    tiempoInicial: 180,
    juegoTerminado: false,
    juegoGanado: false,
    juegoFinalizado: false,
    timerInterval: null,
    gameConfig: null,
    mensajeExito: '¡Excelente trabajo!',
    mensajeFallo: 'Inténtalo de nuevo',
    colorFondo: '#ffffff',
    colorTexto: '#000000',
    fuente: 'Arial',
    cargando: true,
    error: '',
    palabrasJuego: [],
    indicePalabraActual: 0,
    palabrasCompletadas: 0,
    totalPalabras: 0,
    contadorCambio: 0,
    intervaloContador: null,
  };

  alfabeto: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  mostrarModalTiempoAgotado = false;
  mostrarModalJuegoFinalizado = false;
  mostrarModalFallo = false;
  mostrarModalExito = false;
  mostrarPista = false;
  palabrasCanvasVisible = true;
  palabrasAdivinadas: string[] = [];
  tiempoRestanteModal = 3;
  headerExpanded: boolean = false;
  
  // Rating properties
  mostrarModalRating = false;
  gameInstanceId = 0;
  hasUserRated = false;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
  }

  protected onAuthenticationReady(userId: number): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id && !isNaN(id)) {
      this.cargarConfiguracionJuego(id);
    } else {
      this.state.error = 'ID de juego inválido';
      this.state.cargando = false;
    }
  }

  palabraAdivinada() {
    this.mostrarModalExito = true;
    this.state.palabrasCompletadas++;

    // Marcar palabra como completada en el canvas
    const palabraActual = this.state.palabraActual;
    const index = this.palabrasAdivinadas.findIndex(
      (p) => this.limpiarPalabra(p) === palabraActual
    );
    if (index !== -1) {
      this.palabrasAdivinadas[index] = `~~${palabraActual}~~`;
    }

    // PAUSAR el timer durante la alerta de éxito
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }

    // Verificar si hay más palabras para determinar el flujo
    if (this.state.indicePalabraActual + 1 < this.state.totalPalabras) {
      // Mostrar SweetAlert de éxito amigable para niños (Evento #2: palabra adivinada correctamente)
      Swal.fire({
        icon: 'success',
        title: '🎉 ¡Súper bien hecho!',
        html: `
          <div style="font-family: 'Arial', sans-serif; text-align: center;">
            <div style="font-size: 60px; margin: 20px 0;">🌟</div>
            <p style="font-size: 18px; color: #2d5a27; margin: 15px 0; font-weight: 600;">
              ¡Adivinaste la palabra!
            </p>
            <div style="background: linear-gradient(135deg, #a8e6cf, #dcedc8); padding: 15px; border-radius: 15px; margin: 15px 0;">
              <p style="font-size: 24px; font-weight: bold; color: #2e7d32; margin: 0;">${palabraActual}</p>
            </div>
            <p style="font-size: 16px; color: #555; margin: 10px 0;">
              🚀 ¡Vamos por la siguiente palabra!
            </p>
          </div>
        `,
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        color: '#1e40af',
        confirmButtonColor: '#10b981',
        confirmButtonText: '✨ ¡Continuar aventura!',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: 'animated-popup',
          confirmButton: 'kid-friendly-button',
        },
      }).then(() => {
        // Después de exactamente 5 segundos o botón, continuar
        this.continuarSiguientePalabra();
      });

      // Iniciar contador de 5 segundos
      this.iniciarContadorCambio();
    } else {
      // Juego completado - finalizar
      this.finalizarJuego(true);
    }
  }

  private iniciarContadorCambio() {
    this.state.contadorCambio = 5;
    if (this.intervaloContador) {
      clearInterval(this.intervaloContador);
    }
    this.intervaloContador = setInterval(() => {
      this.state.contadorCambio--;
      if (this.state.contadorCambio <= 0) {
        this.continuarSiguientePalabra();
      }
    }, 1000);
  }
  continuarSiguientePalabra() {
    // Limpiar intervalo y modal de éxito
    if (this.intervaloContador) {
      clearInterval(this.intervaloContador);
      this.intervaloContador = null;
    }
    this.mostrarModalExito = false;

    // Pasar a la siguiente palabra
    this.state.indicePalabraActual++;
    this.configurarPalabraActual();
    this.state.palabraRevelada = Array(this.state.palabraActual.length).fill(
      ''
    );
    this.state.letrasSeleccionadas.clear();
    this.state.intentosRestantes = this.INTENTOS_INICIALES;
    this.state.contadorCambio = 0;
    this.state.juegoTerminado = false;
    this.state.juegoGanado = false;

    // REANUDAR el timer después de la pausa de exactamente 5 segundos
    // El tiempo restante se mantiene igual que cuando se pausó
    this.iniciarTimer();
  }

  cargarConfiguracionJuego(id: number): void {
    this.state.cargando = true;
    this.state.error = '';

    this.gameConfigService.getGameConfiguration(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.state.gameConfig = response.data;
          this.gameInstanceId = response.data.game_instance_id; // Guardar el gameInstanceId
          this.aplicarConfiguracion();
          this.iniciarJuego();
          this.checkIfUserHasRated(); // Verificar si ya valoró el juego
        } else {
          this.state.error =
            response.message || 'No se pudo cargar la configuración del juego';
        }
        this.state.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando configuración:', error);
        this.state.error = 'Error al cargar la configuración del juego';
        this.state.cargando = false;
      },
    });
  }

  aplicarConfiguracion(): void {
    if (!this.state.gameConfig) return;
    const config = this.state.gameConfig;

    // Aplicar configuraciones desde settings
    if (config.settings && Array.isArray(config.settings)) {
      config.settings.forEach((setting) => {
        switch (setting.key) {
          case 'TiempoLimite':
            this.state.tiempoInicial = parseInt(setting.value) || 180;
            this.state.tiempoRestante = this.state.tiempoInicial;
            break;
          case 'MensajeExito':
            this.state.mensajeExito = setting.value;
            break;
          case 'MensajeFallo':
            this.state.mensajeFallo = setting.value;
            break;
          case 'ColorFondo':
            this.state.colorFondo = setting.value;
            break;
          case 'ColorTexto':
            this.state.colorTexto = setting.value;
            break;
          case 'Fuente':
            this.state.fuente = setting.value;
            break;
        }
      });
    }

    // Cargar palabras del hangman_words
    if (Array.isArray(config.hangman_words)) {
      this.state.palabrasJuego = config.hangman_words.map((item) => ({
        ...item,
        word: item.word.toUpperCase(),
      }));
      this.state.totalPalabras = this.state.palabrasJuego.length;
      this.state.indicePalabraActual = 0;
      // Inicializar palabrasAdivinadas para el canvas flotante
      this.palabrasAdivinadas = this.state.palabrasJuego.map(
        (item) => item.word
      );
    } else {
      this.state.palabrasJuego = [];
      this.state.totalPalabras = 0;
      this.state.indicePalabraActual = 0;
      this.palabrasAdivinadas = [];
    }
  }
  configurarPalabraActual(): void {
    if (this.state.indicePalabraActual < this.state.palabrasJuego.length) {
      const palabraData =
        this.state.palabrasJuego[this.state.indicePalabraActual];
      this.state.palabraActual = palabraData.word.toUpperCase();
      this.state.pistaPalabra = palabraData.clue;
    }
  }

  iniciarJuego(): void {
    if (!this.state.gameConfig || this.state.palabrasJuego.length === 0) {
      this.state.error = 'No se pudo inicializar el juego';
      return;
    }

    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }

    // Configurar la palabra actual
    this.configurarPalabraActual();

    // Resetear estado del juego pero mantener configuración
    this.state = {
      ...this.state,
      palabraRevelada: Array(this.state.palabraActual.length).fill(''),
      letrasSeleccionadas: new Set<string>(),
      intentosRestantes: this.INTENTOS_INICIALES,
      tiempoRestante: this.state.tiempoInicial,
      juegoTerminado: false,
      juegoGanado: false,
      timerInterval: null,
    };

    this.iniciarTimer();
  }

  seleccionarLetra(letra: string): void {
    if (
      this.state.juegoTerminado ||
      this.state.letrasSeleccionadas.has(letra)
    ) {
      return;
    }

    this.state.letrasSeleccionadas.add(letra);

    if (this.state.palabraActual.includes(letra)) {
      // Letra correcta
      for (let i = 0; i < this.state.palabraActual.length; i++) {
        if (this.state.palabraActual[i] === letra) {
          this.state.palabraRevelada[i] = letra;
        }
      }

      if (!this.state.palabraRevelada.includes('')) {
        this.palabraAdivinada();
      }
    } else {
      this.state.intentosRestantes--;

      if (this.state.intentosRestantes <= 0) {
        if (this.state.vidasRestantes > 1) {
          this.mostrarAlertaAhorcadoConVidas();
          setTimeout(() => {
            this.resetearPalabraParaNuevoIntento();
          }, 3500);
        } else {
          this.finalizarJuego(false);
        }
      }
    }
  }
  pasarSiguientePalabra(): void {
    this.tacharPalabraCanvas(this.state.palabraActual);

    this.mostrarModalExito = true;
    setTimeout(() => {
      this.mostrarModalExito = false;

      this.state.indicePalabraActual++;
      this.configurarPalabraActual();
      this.state.palabraRevelada = Array(this.state.palabraActual.length).fill(
        ''
      );
      this.state.letrasSeleccionadas = new Set<string>();
      this.state.intentosRestantes = this.INTENTOS_INICIALES;

      this.state.tiempoRestante = this.state.tiempoInicial;
      if (this.state.timerInterval) {
        clearInterval(this.state.timerInterval);
      }
      this.iniciarTimer();
    }, 1500);
  }
  tacharPalabraCanvas(palabra: string) {
    const palabraUpper = palabra.toUpperCase();
    const idx = this.palabrasAdivinadas.findIndex(
      (p) => this.limpiarPalabra(p) === palabraUpper
    );

    if (idx !== -1) {
      this.palabrasAdivinadas[idx] =
        '~~' + this.limpiarPalabra(this.palabrasAdivinadas[idx]) + '~~';
    }
  }

  finalizarJuego(ganado: boolean): void {
    this.mostrarModalTiempoAgotado = false;
    this.mostrarModalFallo = false;
    this.mostrarModalExito = false;
    this.mostrarModalJuegoFinalizado = false;

    this.state.juegoTerminado = true;
    this.state.juegoGanado = ganado;

    if (!ganado && this.state.vidasRestantes <= 0) {
      if (this.state.timerInterval) {
        clearInterval(this.state.timerInterval);
      }
    }
    if (this.intervaloContador) {
      clearInterval(this.intervaloContador);
      this.intervaloContador = null;
    }

    if (!ganado) {
      if (this.state.vidasRestantes <= 0) {
        this.state.juegoFinalizado = true;
        this.mostrarModalJuegoFinalizado = true;

        Swal.fire({
          icon: 'error',
          title: '😢 ¡Oh no, se acabaron las vidas!',
          html: `
            <div style="font-family: 'Arial', sans-serif; text-align: center;">
              <div style="font-size: 80px; margin: 20px 0;">😭</div>
              <p style="font-size: 18px; color: #d32f2f; margin: 15px 0; font-weight: 600;">
                ¡No te preocupes, los grandes exploradores también fallan!
              </p>
              <div style="background: linear-gradient(135deg, #ffebee, #fce4ec); padding: 15px; border-radius: 15px; margin: 15px 0;">
                <p style="font-size: 16px; color: #c62828; margin: 0;">
                  🌟 ¡Cada intento te hace más fuerte!
                </p>
              </div>
              <p style="font-size: 16px; color: #555; margin: 10px 0;">
                💪 ¿Quieres intentarlo otra vez?
              </p>
            </div>
          `,
          background: 'linear-gradient(135deg, #fff3e0, #fce4ec)',
          confirmButtonColor: '#ff6b35',
          confirmButtonText: '🎮 ¡Jugar de nuevo!',
          showCancelButton: true,
          cancelButtonText: '🏠 Volver al menú',
          cancelButtonColor: '#78909c',
          allowOutsideClick: false,
          customClass: {
            popup: 'animated-popup',
            confirmButton: 'kid-friendly-button',
            cancelButton: 'kid-friendly-button-secondary',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            this.reiniciarJuego();
          } else {
            this.volverAlDashboard();
          }
          // Mostrar modal de valoración después de la acción (juego terminado sin vidas)
          setTimeout(() => this.mostrarModalDeValoracion(), 500);
        });
      } else {
        if (this.state.tiempoRestante === 0) {
          this.mostrarModalTiempoAgotado = true;
          Swal.fire({
            icon: 'warning',
            title: '⏰ ¡Se acabó el tiempo!',
            html: `
              <div style="font-family: 'Arial', sans-serif; text-align: center;">
                <div style="font-size: 60px; margin: 20px 0;">⏱️</div>
                <p style="font-size: 18px; color: #f57c00; margin: 15px 0; font-weight: 600;">
                  ¡El tiempo voló muy rápido!
                </p>
                <div style="background: linear-gradient(135deg, #fff8e1, #ffecb3); padding: 15px; border-radius: 15px; margin: 15px 0;">
                  <p style="font-size: 16px; color: #e65100; margin: 0;">
                    💝 Te quedan ${this.state.vidasRestantes} ${
              this.state.vidasRestantes === 1 ? 'vida' : 'vidas'
            }
                  </p>
                </div>
                <p style="font-size: 16px; color: #555; margin: 10px 0;">
                  🚀 ¡Puedes hacerlo mejor!
                </p>
              </div>
            `,
            background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
            confirmButtonColor: '#ff9800',
            confirmButtonText: '💪 ¡Intentar de nuevo!',
            timer: 4000,
            timerProgressBar: true,
            allowOutsideClick: false,
            customClass: {
              popup: 'animated-popup',
              confirmButton: 'kid-friendly-button',
            },
          });
        }
      }
    } else {
      for (let i = 0; i < this.state.palabraActual.length; i++) {
        this.state.palabraRevelada[i] = this.state.palabraActual[i];
      }

      if (this.state.indicePalabraActual + 1 >= this.state.totalPalabras) {
        Swal.fire({
          icon: 'success',
          title: '🏆 ¡Eres un súper héroe de las palabras!',
          html: `
            <div style="font-family: 'Arial', sans-serif; text-align: center;">
              <div style="font-size: 80px; margin: 20px 0;">🎊</div>
              <p style="font-size: 20px; color: #2e7d32; margin: 15px 0; font-weight: bold;">
                ¡Completaste TODAS las palabras!
              </p>
              <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 20px; border-radius: 15px; margin: 15px 0;">
                <p style="font-size: 18px; color: #1b5e20; margin: 0;">
                  🌟 ¡Eres increíblemente inteligente!
                </p>
              </div>
              <p style="font-size: 16px; color: #555; margin: 10px 0;">
                🎮 ¿Quieres una nueva aventura?
              </p>
            </div>
          `,
          background: 'linear-gradient(135deg, #e8f5e8, #f1f8e9)',
          confirmButtonColor: '#4caf50',
          confirmButtonText: '🚀 ¡Nueva aventura!',
          showCancelButton: true,
          cancelButtonText: '🏠 Volver al menú',
          cancelButtonColor: '#78909c',
          allowOutsideClick: false,
          customClass: {
            popup: 'animated-popup',
            confirmButton: 'kid-friendly-button',
            cancelButton: 'kid-friendly-button-secondary',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            this.reiniciarJuego();
          } else {
            this.volverAlDashboard();
          }
          // Mostrar modal de valoración después de la acción (victoria completa)
          setTimeout(() => this.mostrarModalDeValoracion(), 500);
        });
      } else {
        this.mostrarModalExito = true;
        this.iniciarContadorCambio();
      }
    }
  }

  reiniciarPalabraActual(): void {
    this.mostrarModalFallo = false;
    this.mostrarModalTiempoAgotado = false;

    this.state.palabraRevelada = Array(this.state.palabraActual.length).fill(
      ''
    );
    this.state.letrasSeleccionadas = new Set<string>();
    this.state.intentosRestantes = this.INTENTOS_INICIALES;
    this.state.tiempoRestante = this.state.tiempoInicial;
    this.state.juegoTerminado = false;
    this.state.juegoGanado = false;

    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
    this.iniciarTimer();
  }

  reiniciarJuego(): void {
    this.mostrarModalTiempoAgotado = false;
    this.mostrarModalJuegoFinalizado = false;
    this.mostrarModalFallo = false;
    this.mostrarModalExito = false;

    Swal.fire({
      icon: 'success',
      title: '🎮 ¡Nueva aventura comenzando!',
      html: `
      <div style="font-family: 'Arial', sans-serif; text-align: center;">
        <div style="font-size: 60px; margin: 20px 0;">🚀</div>
        <p style="font-size: 18px; color: #1565c0; margin: 15px 0; font-weight: 600;">
          ¡Empezamos un juego completamente nuevo!
        </p>
        <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 15px; margin: 15px 0;">
          <p style="font-size: 16px; color: #0d47a1; margin: 0;">
            🌟 ¡Prepárate para descubrir palabras increíbles!
          </p>
        </div>
        <p style="font-size: 16px; color: #555; margin: 10px 0;">
          💪 ¡Tú puedes hacerlo!
        </p>
      </div>
    `,
      background: 'linear-gradient(135deg, #e3f2fd, #f3e5f5)',
      confirmButtonColor: '#2196f3',
      confirmButtonText: '✨ ¡Vamos a jugar!',
      timer: 2500,
      timerProgressBar: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button',
      },
    });

    this.state.indicePalabraActual = 0;
    this.state.palabrasCompletadas = 0;
    this.state.vidasRestantes = 3;
    this.state.juegoFinalizado = false;

    this.palabrasAdivinadas = this.state.palabrasJuego.map((item) =>
      item.word.toUpperCase()
    );

    this.iniciarJuego();
  }
  get progresoJuego(): string {
    return `Palabra ${this.state.indicePalabraActual + 1} de ${
      this.state.totalPalabras
    }`;
  }

  get porcentajeProgreso(): number {
    if (this.state.totalPalabras === 0) return 0;
    return Math.round(
      (this.state.palabrasCompletadas / this.state.totalPalabras) * 100
    );
  }

  volverAlDashboard(): void {
    this.mostrarModalTiempoAgotado = false;
    this.mostrarModalJuegoFinalizado = false;
    this.mostrarModalFallo = false;
    this.router.navigate(['/dashboard']);
  }

  formatearTiempo(): string {
    const minutos = Math.floor(this.state.tiempoRestante / 60);
    const segundos = this.state.tiempoRestante % 60;
    return `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
  }

  iniciarTimer(): void {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
    this.state.timerInterval = setInterval(() => {
      if (this.state.tiempoRestante > 0) {
        this.state.tiempoRestante--;

        if (this.state.tiempoRestante === 30) {
          Swal.fire({
            icon: 'warning',
            title: '⏰ ¡Solo 30 segunditos!',
            html: `
              <div style="font-family: 'Arial', sans-serif; text-align: center;">
                <div style="font-size: 50px; margin: 15px 0;">⏱️</div>
                <p style="font-size: 16px; color: #f57c00; margin: 10px 0; font-weight: 600;">
                  ¡Date prisa, pequeño explorador!
                </p>
                <p style="font-size: 14px; color: #ef6c00; margin: 5px 0;">
                  💨 ¡Quedan solo 30 segundos!
                </p>
              </div>
            `,
            background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
            customClass: {
              popup: 'kid-toast-alert',
            },
          });
        }
      } else {
        this.finalizarJuego(false);
      }
    }, 1000);
  }

  togglePalabrasCanvas() {
    this.palabrasCanvasVisible = !this.palabrasCanvasVisible;
  }

  estaLetraSeleccionada(letra: string): boolean {
    return this.state.letrasSeleccionadas.has(letra);
  }

  estaLetraEnPalabra(letra: string): boolean {
    return this.state.palabraActual.includes(letra);
  }

  limpiarPalabra(palabra: string): string {
    return palabra.replace(/~~/g, '');
  }

  get estilosJuego() {
    return {
      'background-color': this.state.colorFondo,
      color: this.state.colorTexto,
      'font-family': this.state.fuente,
    };
  }

  get tituloJuego(): string {
    return this.state.gameConfig?.game_name || 'Juego del Ahorcado';
  }

  get descripcionJuego(): string {
    return this.state.gameConfig?.game_description || '';
  }

  toggleHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  private mostrarAlertaAhorcadoConVidas(): void {
    Swal.fire({
      icon: 'error',
      title: '😔 ¡El muñequito necesita ayuda!',
      html: `
        <div style="font-family: 'Arial', sans-serif; text-align: center;">
          <div style="font-size: 60px; margin: 20px 0;">😵</div>
          <p style="font-size: 18px; color: #d32f2f; margin: 15px 0; font-weight: 600;">
            ¡Se completó el dibujo del ahorcado!
          </p>
          <div style="background: linear-gradient(135deg, #ffebee, #fce4ec); padding: 15px; border-radius: 15px; margin: 15px 0;">
            <p style="font-size: 16px; color: #c62828; margin: 0;">
              💖 Pero aún tienes ${this.state.vidasRestantes - 1} ${
        this.state.vidasRestantes - 1 === 1 ? 'vida' : 'vidas'
      } para salvarlo
            </p>
          </div>
          <p style="font-size: 16px; color: #555; margin: 10px 0;">
            🎯 ¡Nueva palabra en 3 segundos!
          </p>
        </div>
      `,
      background: 'linear-gradient(135deg, #ffebee, #fce4ec)',
      confirmButtonColor: '#e53935',
      confirmButtonText: '💪 ¡Entendido!',
      timer: 3000,
      timerProgressBar: true,
      allowOutsideClick: true,
      showCloseButton: true,
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button',
      },
    });
  }
  private resetearPalabraParaNuevoIntento(): void {
    this.state.vidasRestantes--;

    this.state.palabraRevelada = Array(this.state.palabraActual.length).fill(
      ''
    );
    this.state.letrasSeleccionadas = new Set<string>();
    this.state.intentosRestantes = this.INTENTOS_INICIALES;
    this.state.juegoTerminado = false;
    this.state.juegoGanado = false;
  }

  // Rating methods
  private async checkIfUserHasRated(): Promise<void> {
    if (this.gameInstanceId > 0) {
      try {
        this.hasUserRated = await firstValueFrom(this.ratingService.hasUserRatedGame(this.gameInstanceId));
      } catch (error) {
        console.warn('No se pudo verificar si el usuario ya valoró el juego:', error);
        this.hasUserRated = false; // Asumir que no ha valorado en caso de error
      }
    }
  }

  private mostrarModalDeValoracion(): void {
    // Solo mostrar el modal si el usuario no ha valorado aún
    if (!this.hasUserRated && this.gameInstanceId > 0) {
      this.mostrarModalRating = true;
    }
  }

  onRatingModalClose(): void {
    this.mostrarModalRating = false;
  }

  onGameRated(): void {
    this.hasUserRated = true;
    console.log('¡Juego valorado exitosamente!');
  }
}
