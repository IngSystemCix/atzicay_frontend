import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface JuegoState {
  palabraActual: string;
  pistaPalabra: string;
  palabraRevelada: string[];
  letrasSeleccionadas: Set<string>;
  intentosRestantes: number;
  tiempoRestante: number;
  numPalabra: number;
  totalPalabras: number;
  juegoTerminado: boolean;
  juegoGanado: boolean;
  timerInterval: any;
}

@Component({
  selector: 'app-game-hangman',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-hangman.component.html',
  styleUrls: ['./game-hangman.component.css']
})
export class GameHangmanComponent implements OnInit, OnDestroy {
  state: JuegoState = {
    palabraActual: '',
    pistaPalabra: '',
    palabraRevelada: [],
    letrasSeleccionadas: new Set<string>(),
    intentosRestantes: 6,
    tiempoRestante: 120, // 2 minutos en segundos
    numPalabra: 1,
    totalPalabras: 5,
    juegoTerminado: false,
    juegoGanado: false,
    timerInterval: null
  };

  palabras = [
    { palabra: 'ELEFANTE', pista: 'Animal grande con trompa' },
    { palabra: 'JIRAFA', pista: 'Animal con cuello largo' },
    { palabra: 'TIGRE', pista: 'Felino con rayas' },
    { palabra: 'BALLENA', pista: 'Mamífero marino de gran tamaño' },
    { palabra: 'COCODRILO', pista: 'Reptil acuático con grandes mandíbulas' }
  ];

  alfabeto: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  ngOnInit(): void {
    this.iniciarJuego();
  }

  ngOnDestroy(): void {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
  }

  iniciarJuego(): void {
    // Seleccionar una palabra aleatoria real
    const randomIndex = Math.floor(Math.random() * this.palabras.length);
    const palabraSeleccionada = this.palabras[randomIndex];

    this.state = {
      palabraActual: palabraSeleccionada.palabra,
      pistaPalabra: palabraSeleccionada.pista,
      palabraRevelada: Array(palabraSeleccionada.palabra.length).fill(''),
      letrasSeleccionadas: new Set<string>(),
      intentosRestantes: 6,
      tiempoRestante: 120,
      numPalabra: this.state.numPalabra || 1,
      totalPalabras: this.palabras.length,
      juegoTerminado: false,
      juegoGanado: false,
      timerInterval: null
    };

    this.iniciarTimer();
  }

  seleccionarLetra(letra: string): void {
    if (this.state.juegoTerminado || this.state.letrasSeleccionadas.has(letra)) {
      return;
    }

    this.state.letrasSeleccionadas.add(letra);

    if (this.state.palabraActual.includes(letra)) {
      // Actualizar la palabra revelada
      for (let i = 0; i < this.state.palabraActual.length; i++) {
        if (this.state.palabraActual[i] === letra) {
          this.state.palabraRevelada[i] = letra;
        }
      }

      // Verificar si se ha ganado el juego
      if (!this.state.palabraRevelada.includes('')) {
        this.finalizarJuego(true);
      }
    } else {
      // Letra incorrecta, reducir intentos
      this.state.intentosRestantes--;
      if (this.state.intentosRestantes <= 0) {
        this.finalizarJuego(false);
      }
    }
  }

  finalizarJuego(ganado: boolean): void {
    this.state.juegoTerminado = true;
    this.state.juegoGanado = ganado;
    clearInterval(this.state.timerInterval);

    if (!ganado) {
      // Revelar la palabra completa
      this.state.palabraRevelada = this.state.palabraActual.split('');
    }
  }

  reiniciarJuego(): void {
    clearInterval(this.state.timerInterval);

    // Incrementar el número de palabra
    if (this.state.numPalabra < this.state.totalPalabras) {
      this.state.numPalabra++;
    } else {
      // Si ya se jugaron todas las palabras, volver a empezar
      this.state.numPalabra = 1;
    }

    this.iniciarJuego();
  }

  iniciarTimer(): void {
    this.state.timerInterval = setInterval(() => {
      if (this.state.tiempoRestante > 0) {
        this.state.tiempoRestante--;
      } else {
        this.finalizarJuego(false);
      }
    }, 1000);
  }

  formatearTiempo(): string {
    const minutos = Math.floor(this.state.tiempoRestante / 60);
    const segundos = this.state.tiempoRestante % 60;
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  }

  estaLetraSeleccionada(letra: string): boolean {
    return this.state.letrasSeleccionadas.has(letra);
  }

  estaLetraEnPalabra(letra: string): boolean {
    return this.state.palabraActual.includes(letra);
  }

  obtenerClaseLetra(letra: string): string {
    if (!this.estaLetraSeleccionada(letra)) {
      return 'bg-white hover:bg-purple-100';
    }
    return this.estaLetraEnPalabra(letra) ? 'bg-green-100' : 'bg-red-100';
  }
}
