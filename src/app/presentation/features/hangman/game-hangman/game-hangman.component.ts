import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration, HangmanWord } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { GameAlertService, GameAlertConfig } from '../../../../core/infrastructure/service/game-alert.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';
import { GameUrlService } from '../../../../core/infrastructure/services/game-url.service';
import { FloatingLogoComponent } from '../../../components/floating-logo/floating-logo.component';

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
  userAssessed: boolean; 
}

@Component({
  selector: 'app-game-hangman',
  standalone: true,
  imports: [CommonModule, FloatingLogoComponent],
  templateUrl: './game-hangman.component.html',
  styleUrls: ['./game-hangman.component.css'],
})
export class GameHangmanComponent extends BaseAuthenticatedComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameConfigService = inject(GameConfigurationService);
  private gameAlertService = inject(GameAlertService);
  private ratingModalService = inject(RatingModalService);
  private gameAudioService = inject(GameAudioService);
  private gameUrlService = inject(GameUrlService);

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
    userAssessed: false,
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

  override ngOnInit(): void {
    super.ngOnInit();
    
    // Ejemplo adicional: capturar parámetros de forma reactiva con observables
    // Esto es útil cuando los parámetros pueden cambiar sin recargar el componente
    this.subscription.add(
      this.route.params.subscribe(params => {
        
        // También puedes capturar query parameters
        this.route.queryParams.subscribe(queryParams => {
          // Ejemplo: ?userId=123&withProgrammings=true
          const userId = queryParams['userId'];
          const withProgrammings = queryParams['withProgrammings'];
        });
      })
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
  }

  protected onAuthenticationReady(userId: number): void {
    // Capturar parámetros de ruta - puede ser 'id' o 'token'
    const id = this.route.snapshot.params['id'];
    const token = this.route.snapshot.params['token'];
    
    if (token) {
      // Si tenemos un token, validarlo primero
      this.gameUrlService.validateGameToken(token).subscribe({
        next: (response) => {
          if (response.valid && response.gameInstanceId) {
            this.cargarConfiguracionJuego(response.gameInstanceId);
          } else {
            console.error('❌ Token inválido o expirado');
            this.state.error = 'El enlace del juego ha expirado o no es válido';
            this.state.cargando = false;
          }
        },
        error: (error) => {
          console.error('❌ Error validando token:', error);
          this.state.error = 'Error al validar el acceso al juego';
          this.state.cargando = false;
        }
      });
    } else if (id) {
      // Si tenemos un ID tradicional, usarlo directamente
      const gameId = Number(id);
      if (gameId && !isNaN(gameId)) {
        this.cargarConfiguracionJuego(gameId);
      } else {
        console.error('❌ ID de juego inválido:', id);
        this.state.error = 'ID de juego inválido';
        this.state.cargando = false;
      }
    } else {
      console.error('❌ No se encontró ID ni token en la URL');
      this.state.error = 'No se encontró información del juego en la URL';
      this.state.cargando = false;
    }
  }

  palabraAdivinada() {
    this.state.palabrasCompletadas++;
    
    // Marcar palabra como completada en el canvas
    const palabraActual = this.state.palabraActual;
    const index = this.palabrasAdivinadas.findIndex(p => 
      this.limpiarPalabra(p) === palabraActual
    );
    if (index !== -1) {
      this.palabrasAdivinadas[index] = `~~${palabraActual}~~`;
    }

    // Verificar si se completaron todas las palabras
    if (this.state.palabrasCompletadas >= this.state.totalPalabras) {
      // Juego completado, mostrar modal de valoración si no ha evaluado
      if (!this.state.userAssessed) {
        this.showRatingAlert();
      }
      this.showSuccessAlert();
      return;
    }

    // Si hay más palabras, mostrar éxito y continuar automáticamente
    this.showWordSuccessAlert();
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
    this.inicializarPalabraRevelada();
    this.state.letrasSeleccionadas.clear();
    this.state.intentosRestantes = this.INTENTOS_INICIALES;
    this.state.contadorCambio = 0;
    this.state.juegoTerminado = false;
    this.state.juegoGanado = false;
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
    this.iniciarTimer();
  }


  cargarConfiguracionJuego(id: number): void {
    this.state.cargando = true;
    this.state.error = '';

    // Get userId from authenticated user
    const userId = this.currentUserId;

    this.gameConfigService.getGameConfiguration(id, userId || undefined, false).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.state.gameConfig = response.data;
          this.aplicarConfiguracion();
          this.iniciarJuego();
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

    // Guardar el estado de evaluación del usuario
    this.state.userAssessed = config.assessed || false;

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
      this.palabrasAdivinadas = this.state.palabrasJuego.map((item) => item.word);
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
    this.gameAudioService.playGameStart();
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
      letrasSeleccionadas: new Set<string>(),
      intentosRestantes: this.INTENTOS_INICIALES,
      tiempoRestante: this.state.tiempoInicial,
      juegoTerminado: false,
      juegoGanado: false,
      timerInterval: null,
    };

    // Inicializar palabra revelada con espacios pre-revelados
    this.inicializarPalabraRevelada();

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
      this.gameAudioService.playHangmanCorrectLetter();
      for (let i = 0; i < this.state.palabraActual.length; i++) {
        if (this.state.palabraActual[i] === letra) {
          this.state.palabraRevelada[i] = letra;
        }
      }

      // Verificar si la palabra está completa (ignorando espacios)
      const letrasNoEspacio = this.state.palabraActual.split('').filter(c => c !== ' ');
      const letrasReveladasNoEspacio = this.state.palabraRevelada.filter((c, i) => this.state.palabraActual[i] !== ' ' && c !== '');
      
      if (letrasNoEspacio.length === letrasReveladasNoEspacio.length) {
        this.gameAudioService.playHangmanWordComplete();
        this.tacharPalabraCanvas(this.state.palabraActual);
        this.state.palabrasCompletadas++;

        // Pausar el timer principal mientras se muestra la alerta
        if (this.state.timerInterval) {
          clearInterval(this.state.timerInterval);
          this.state.timerInterval = null;
        }

        // Verificar si hay más palabras
        if (
          this.state.indicePalabraActual + 1 <
          this.state.palabrasJuego.length
        ) {
          // Mostrar la nueva alerta personalizada de palabra completada
          this.showWordSuccessAlert();
        } else {
          // Juego completado
          this.finalizarJuego(true);
        }
      }
    } else {
      // Letra incorrecta
      this.gameAudioService.playHangmanWrongLetter();
      this.gameAudioService.playHangmanDrawPart();
      this.state.intentosRestantes--;

      if (this.state.intentosRestantes <= 0) {
        this.gameAudioService.playHangmanGameOver();
        this.finalizarJuego(false);
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
      this.inicializarPalabraRevelada();
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
    // Limpiar todos los modales antes de mostrar uno
    this.mostrarModalTiempoAgotado = false;
    this.mostrarModalFallo = false;
    this.mostrarModalExito = false;
    this.mostrarModalJuegoFinalizado = false;

    this.state.juegoTerminado = true;
    this.state.juegoGanado = ganado;

    // Solo limpiar el timer si el juego terminó completamente (sin vidas)
    if (!ganado && this.state.vidasRestantes - 1 <= 0) {
      if (this.state.timerInterval) {
        clearInterval(this.state.timerInterval);
      }
    }
    if (this.intervaloContador) {
      clearInterval(this.intervaloContador);
      this.intervaloContador = null;
    }

    if (!ganado) {
      this.state.vidasRestantes--;
      if (this.state.vidasRestantes <= 0) {
        this.state.juegoFinalizado = true;
        
        // Mostrar modal de valoración si el usuario no ha evaluado el juego
        if (!this.state.userAssessed) {
          this.showRatingAlert();
        }
        
        // Mostrar modal de game over usando el servicio
        this.showGameOverAlert();
      } else {
        // Si fue por tiempo, mostrar modal de tiempo agotado
        if (this.state.tiempoRestante === 0) {
          this.showTimeUpAlert();
        } else {
          // Mostrar modal de vida perdida
          this.showLifeLostAlert();
        }
      }
    } else {
      // Revelar toda la palabra solo si ganó
      for (let i = 0; i < this.state.palabraActual.length; i++) {
        this.state.palabraRevelada[i] = this.state.palabraActual[i];
      }
      // Llamar a palabraAdivinada para manejar el éxito
      this.palabraAdivinada();
    }
  }


  reiniciarPalabraActual(): void {
  this.mostrarModalFallo = false;
  this.mostrarModalTiempoAgotado = false;
  
  // Solo reiniciar la palabra actual, NO las vidas
  this.inicializarPalabraRevelada();
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

  // Resetear completamente el estado del juego
  this.state.indicePalabraActual = 0;
  this.state.palabrasCompletadas = 0;
  this.state.vidasRestantes = 3; // Solo aquí se resetean las vidas a 3
  this.state.juegoFinalizado = false;

  // Restaurar todas las palabras en el canvas
  this.palabrasAdivinadas = this.state.palabrasJuego.map((item) =>
    item.word.toUpperCase()
  );

  this.iniciarJuego();
}

  /**
   * Obtiene el progreso actual del juego como una cadena de la forma
   * "Palabra X de Y", donde X es el índice actual de la palabra en el
   * array de palabras y Y es el total de palabras en el juego.
   */
  get progresoJuego(): string {
    return `Palabra ${this.state.indicePalabraActual + 1} de ${
      this.state.totalPalabras
    }`;
  }

  get porcentajeProgreso(): number {
    if (this.state.totalPalabras === 0) return 0;
    return Math.round((this.state.palabrasCompletadas / this.state.totalPalabras) * 100);
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
        
        // Reproducir sonido de advertencia cuando quedan 30 segundos
        if (this.state.tiempoRestante === 30) {
          this.gameAudioService.playTimeWarning();
        }
        
        // Reproducir countdown en los últimos 5 segundos
        if (this.state.tiempoRestante <= 5 && this.state.tiempoRestante > 0) {
          this.gameAudioService.playCountdown();
        }
      } else {
        // Solo mostrar el modal de tiempo agotado
        this.gameAudioService.playTimeUp();
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

  // Método para procesar palabras y mostrar espacios entre ellas
  procesarPalabraParaMostrar(): Array<{ caracter: string; esEspacio: boolean; index: number }> {
    const caracteres = this.state.palabraActual.split('');
    return caracteres.map((caracter, index) => ({
      caracter: caracter,
      esEspacio: caracter === ' ',
      index: index
    }));
  }

  // Verificar si un índice debe mostrarse como espacio
  esEspacio(index: number): boolean {
    return this.state.palabraActual[index] === ' ';
  }

  // Obtener el carácter revelado o el placeholder
  obtenerCaracterRevelado(index: number): string {
    if (this.esEspacio(index)) {
      return ' '; // Espacio siempre visible
    }
    return this.state.palabraRevelada[index] || '';
  }

  // Inicializar palabraRevelada con espacios ya revelados
  inicializarPalabraRevelada(): void {
    this.state.palabraRevelada = Array(this.state.palabraActual.length).fill('');
    // Pre-revelar los espacios
    for (let i = 0; i < this.state.palabraActual.length; i++) {
      if (this.state.palabraActual[i] === ' ') {
        this.state.palabraRevelada[i] = ' ';
      }
    }
  }

  // Getters para aplicar estilos dinámicos
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

  private async showSuccessAlert(): Promise<void> {
    
    // Mostrar modal de valoración si el usuario no ha evaluado el juego
    if (!this.state.userAssessed && this.state.gameConfig && !this.state.gameConfig.assessed) {
      await this.showRatingAlert();
    } else {
      console.log('❌ Modal de valoración NO se muestra porque:', {
        userAssessed: this.state.userAssessed,
        gameAssessed: this.state.gameConfig?.assessed
      });
    }
    
    const timeUsed = this.formatTime(this.state.tiempoInicial - this.state.tiempoRestante);
    const config: GameAlertConfig = {
      gameType: 'hangman',
      gameName: 'Ahorcado',
      timeUsed,
      wordsCompleted: this.state.palabrasCompletadas,
      totalWords: this.state.totalPalabras
    };

    const result = await this.gameAlertService.showSuccessAlert(config);
    if (result.isConfirmed) {
      this.reiniciarJuego();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
    }
  }

  private async showWordSuccessAlert(): Promise<void> {
    const config: GameAlertConfig = {
      gameType: 'hangman',
      gameName: 'Ahorcado',
      currentWord: this.state.palabraActual,
      wordsCompleted: this.state.palabrasCompletadas,
      totalWords: this.state.totalPalabras
    };

    // Mostrar alerta personalizada que dura 5 segundos
    await this.gameAlertService.showWordCompletedAlert(config);
    
    // Continuar automáticamente después de la alerta
    this.continuarSiguientePalabra();
  }

  private async showTimeUpAlert(): Promise<void> {
    // Mostrar modal de valoración si el usuario no ha evaluado el juego
    if (!this.state.userAssessed && this.state.gameConfig && !this.state.gameConfig.assessed) {
      await this.showRatingAlert();
    }
    
    const config: GameAlertConfig = {
      gameType: 'hangman',
      gameName: 'Ahorcado',
      wordsCompleted: this.state.palabrasCompletadas,
      totalWords: this.state.totalPalabras
    };

    const result = await this.gameAlertService.showTimeUpAlert(config);
    if (result.isConfirmed) {
      this.reiniciarPalabraActual();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
    }
  }

  private async showLifeLostAlert(): Promise<void> {
    const config: GameAlertConfig = {
      gameType: 'hangman',
      lives: this.state.vidasRestantes
    };

    const result = await this.gameAlertService.showLifeLostAlert(config);
    if (result.isConfirmed) {
      this.reiniciarPalabraActual();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
    }
  }

  private async showGameOverAlert(): Promise<void> {
    // Mostrar modal de valoración si el usuario no ha evaluado el juego
    if (!this.state.userAssessed && this.state.gameConfig && !this.state.gameConfig.assessed) {
      await this.showRatingAlert();
    }
    
    const config: GameAlertConfig = {
      gameType: 'hangman',
      gameName: 'Ahorcado',
      wordsCompleted: this.state.palabrasCompletadas,
      totalWords: this.state.totalPalabras
    };

    const result = await this.gameAlertService.showGameOverAlert(config);
    if (result.isConfirmed) {
      this.reiniciarJuego();
    } else if (result.isDismissed) {
      // Si presiona "Ir al Dashboard" o cierra el modal
      this.volverAlDashboard();
    }
  }

  private async showRatingAlert(): Promise<void> {
    if (!this.state.gameConfig || !this.currentUserId) return;

    try {
      const gameInstanceId = this.state.gameConfig.game_instance_id;
      const gameName = this.state.gameConfig.game_name || 'Ahorcado';
      
      const result = await this.ratingModalService.showRatingModal(
        gameInstanceId, 
        this.currentUserId, 
        gameName
      );
      
      if (result) {
        this.state.userAssessed = true;
      }
    } catch (error) {
      console.error('Error al mostrar modal de valoración:', error);
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private showRatingModal() {
    // Método legacy - usar showRatingAlert en su lugar
    this.showRatingAlert();
  }
}
