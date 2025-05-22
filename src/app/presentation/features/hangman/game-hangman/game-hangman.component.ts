import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface JuegoState {
  palabraActual: string;
  pistaPalabra: string;
  palabraRevelada: string[];
  letrasSeleccionadas: Set<string>;
  intentosRestantes: number;
  vidasRestantes: number;
  tiempoRestante: number;
  numPalabra: number;
  totalPalabras: number;
  juegoTerminado: boolean;
  juegoGanado: boolean;
  juegoFinalizado: boolean; // nuevo: fin completo
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
  readonly INTENTOS_INICIALES = 5;

  state: JuegoState = {
    palabraActual: '',
    pistaPalabra: '',
    palabraRevelada: [],
    letrasSeleccionadas: new Set<string>(),
    intentosRestantes: 6, // intentos por palabra
    vidasRestantes: 5,
    tiempoRestante: 120,
    numPalabra: 1,
    totalPalabras: 5,
    juegoTerminado: false,
    juegoGanado: false,
    juegoFinalizado: false, // nuevo: fin completo
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
    const randomIndex = Math.floor(Math.random() * this.palabras.length);
    const palabraSeleccionada = this.palabras[randomIndex];

    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }

    this.state = {
      ...this.state,
      palabraActual: palabraSeleccionada.palabra,
      pistaPalabra: palabraSeleccionada.pista,
      palabraRevelada: Array(palabraSeleccionada.palabra.length).fill(''),
      letrasSeleccionadas: new Set<string>(),
      intentosRestantes: 6,
      tiempoRestante: 120,
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
      for (let i = 0; i < this.state.palabraActual.length; i++) {
        if (this.state.palabraActual[i] === letra) {
          this.state.palabraRevelada[i] = letra;
        }
      }

      if (!this.state.palabraRevelada.includes('')) {
        this.finalizarJuego(true);
      }
    } else {
      this.state.intentosRestantes--;

      if (this.state.intentosRestantes <= 0) {
        this.finalizarJuego(false);
      }
    }
  }


  finalizarJuego(ganado: boolean): void {
    this.state.juegoTerminado = true;
    this.state.juegoGanado = ganado;

    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }

    if (!ganado) {
      this.state.vidasRestantes--;

      if (this.state.vidasRestantes <= 0) {
        this.state.juegoFinalizado = true;
      }
    }
  }


  siguientePalabra(): void {
    if (this.state.numPalabra >= this.palabras.length) {
      // Si ya se jugó la última palabra, reinicia desde el principio
      this.state.numPalabra = 1;
    } else {
      this.state.numPalabra++;
    }

    this.iniciarJuego();
  }


  reiniciarJuego(): void {
    if (this.state.juegoFinalizado) {
      // reiniciar todo desde cero
      this.state.vidasRestantes = 5;
      this.state.numPalabra = 1;
      this.state.juegoFinalizado = false;
    }

    this.iniciarJuego();
  }


  formatearTiempo(): string {
    const minutos = Math.floor(this.state.tiempoRestante / 60);
    const segundos = this.state.tiempoRestante % 60;
    return `${minutos}:${segundos < 10 ? '0' + segundos : segundos}`;
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
