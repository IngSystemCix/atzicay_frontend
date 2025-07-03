import { Injectable } from '@angular/core';

export interface GameSounds {
  correctMove: HTMLAudioElement;
  incorrectMove: HTMLAudioElement;
  gameComplete: HTMLAudioElement;
  timeWarning: HTMLAudioElement;
  buttonClick: HTMLAudioElement;
  gameStart: HTMLAudioElement;
  countdown: HTMLAudioElement;
  timeUp: HTMLAudioElement;
  levelUp: HTMLAudioElement;
  powerUp: HTMLAudioElement;
}

export interface HangmanSounds {
  wrongLetter: HTMLAudioElement;
  correctLetter: HTMLAudioElement;
  wordComplete: HTMLAudioElement;
  gameOver: HTMLAudioElement;
  drawPart: HTMLAudioElement;
}

export interface PuzzleSounds {
  piecePlace: HTMLAudioElement;
  pieceWrongPlace: HTMLAudioElement;
  pieceSnap: HTMLAudioElement;
  puzzleComplete: HTMLAudioElement;
  shuffle: HTMLAudioElement;
}

export interface WordSearchSounds {
  wordFound: HTMLAudioElement;
  wordNotFound: HTMLAudioElement;
  allWordsFound: HTMLAudioElement;
  letterSelect: HTMLAudioElement;
  wordHighlight: HTMLAudioElement;
}

export interface MemorySounds {
  cardFlip: HTMLAudioElement;
  cardMatch: HTMLAudioElement;
  cardMismatch: HTMLAudioElement;
  allMatched: HTMLAudioElement;
  cardHide: HTMLAudioElement;
}

@Injectable({
  providedIn: 'root'
})
export class GameAudioService {
  private sounds: Partial<GameSounds> = {};
  private hangmanSounds: Partial<HangmanSounds> = {};
  private puzzleSounds: Partial<PuzzleSounds> = {};
  private wordSearchSounds: Partial<WordSearchSounds> = {};
  private memorySounds: Partial<MemorySounds> = {};
  private isEnabled = true;
  private volume = 0.7;

  constructor() {
    this.initializeSounds();
    this.initializeGameSpecificSounds();
  }

  private initializeSounds(): void {
    try {
      // Sonido de movimiento correcto - tono positivo
      this.sounds.correctMove = this.createBeepSound(800, 0.1, 'sawtooth');
      
      // Sonido de movimiento incorrecto - tono negativo
      this.sounds.incorrectMove = this.createBeepSound(200, 0.2, 'square');
      
      // Sonido de juego completado - melodía de victoria
      this.sounds.gameComplete = this.createVictorySound();
      
      // Sonido de advertencia de tiempo - beeps urgentes
      this.sounds.timeWarning = this.createTimeWarningSound();
      
      // Sonido de click de botón
      this.sounds.buttonClick = this.createBeepSound(600, 0.05, 'sine');

      // Nuevos sonidos generales
      this.sounds.gameStart = this.createMelodySound([440, 554, 659], [0.15, 0.15, 0.3]);
      this.sounds.countdown = this.createBeepSound(1000, 0.15, 'sine');
      this.sounds.timeUp = this.createDescendingSound([800, 600, 400, 200], 0.8);
      this.sounds.levelUp = this.createAscendingSound([523, 659, 784, 1047], 0.2);
      this.sounds.powerUp = this.createBeepSound(1200, 0.25, 'sawtooth');

      // Configurar volúmenes
      Object.values(this.sounds).forEach(sound => {
        if (sound) {
          sound.volume = this.volume;
        }
      });

    } catch (error) {
      console.warn('No se pudieron inicializar los sonidos:', error);
    }
  }

  private initializeGameSpecificSounds(): void {
    try {
      // Inicializar sonidos de Hangman
      this.hangmanSounds = {
        wrongLetter: this.createBeepSound(150, 0.3, 'sawtooth'), // Sonido grave y áspero
        correctLetter: this.createBeepSound(700, 0.15, 'sine'), // Sonido claro y positivo
        wordComplete: this.createMelodySound([523, 659, 784, 1047], [0.2, 0.2, 0.2, 0.4]), // Do-Mi-Sol-Do
        gameOver: this.createDescendingSound([400, 300, 200, 100], 0.5), // Sonido dramático descendente
        drawPart: this.createBeepSound(300, 0.2, 'triangle') // Sonido neutro para dibujar
      };

      // Inicializar sonidos de Puzzle
      this.puzzleSounds = {
        piecePlace: this.createBeepSound(600, 0.1, 'sine'), // Sonido suave de colocación
        pieceWrongPlace: this.createBeepSound(250, 0.2, 'square'), // Sonido de error
        pieceSnap: this.createSnapSound(), // Sonido de encaje
        puzzleComplete: this.createVictoryMelody(), // Melodía de victoria elaborada
        shuffle: this.createShuffleSound() // Sonido de mezcla
      };

      // Inicializar sonidos de Sopa de Letras
      this.wordSearchSounds = {
        wordFound: this.createAscendingSound([400, 500, 600], 0.15), // Sonido ascendente
        wordNotFound: this.createBeepSound(200, 0.25, 'sawtooth'),
        allWordsFound: this.createCelebrationSound(), // Sonido de celebración
        letterSelect: this.createBeepSound(800, 0.05, 'sine'), // Sonido sutil de selección
        wordHighlight: this.createBeepSound(650, 0.1, 'triangle') // Sonido de resaltado
      };

      // Inicializar sonidos de Memory
      this.memorySounds = {
        cardFlip: this.createCardFlipSound(), // Sonido de voltear carta
        cardMatch: this.createMatchSound(), // Sonido de coincidencia
        cardMismatch: this.createBeepSound(180, 0.3, 'square'), // Sonido de no coincidencia
        allMatched: this.createVictoryFanfare(), // Fanfarria de victoria
        cardHide: this.createBeepSound(400, 0.08, 'sine') // Sonido sutil de ocultar
      };

      // Configurar volúmenes para todos los sonidos nuevos
      [this.hangmanSounds, this.puzzleSounds, this.wordSearchSounds, this.memorySounds].forEach(gameSound => {
        Object.values(gameSound).forEach(sound => {
          if (sound) sound.volume = this.volume;
        });
      });

    } catch (error) {
      console.warn('Error inicializando sonidos específicos de juegos:', error);
    }
  }

  private createBeepSound(frequency: number, duration: number, type: OscillatorType = 'sine'): HTMLAudioElement {
    // Crear un AudioContext para generar sonidos programáticamente
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    // Crear un audio element mock que simule la interfaz HTMLAudioElement
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const newOscillator = audioContext.createOscillator();
          const newGainNode = audioContext.createGain();

          newOscillator.connect(newGainNode);
          newGainNode.connect(audioContext.destination);

          newOscillator.frequency.value = frequency;
          newOscillator.type = type;

          newGainNode.gain.setValueAtTime(0, audioContext.currentTime);
          newGainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
          newGainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

          newOscillator.start(audioContext.currentTime);
          newOscillator.stop(audioContext.currentTime + duration);

          newOscillator.onended = () => resolve();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createVictorySound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          let noteIndex = 0;

          const playNote = () => {
            if (noteIndex >= notes.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = notes[noteIndex];
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

            oscillator.onended = () => {
              noteIndex++;
              setTimeout(playNote, 100);
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createTimeWarningSound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          let beepCount = 0;
          const totalBeeps = 3;

          const playBeep = () => {
            if (beepCount >= totalBeeps) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 1000;
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);

            oscillator.onended = () => {
              beepCount++;
              setTimeout(playBeep, 150);
            };
          };

          playBeep();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createMelodySound(frequencies: number[], durations: number[]): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          let noteIndex = 0;

          const playNote = () => {
            if (noteIndex >= frequencies.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequencies[noteIndex];
            oscillator.type = 'sine';

            const duration = durations[noteIndex] || 0.2;
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);

            oscillator.onended = () => {
              noteIndex++;
              setTimeout(playNote, 50);
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createDescendingSound(frequencies: number[], totalDuration: number): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          let noteIndex = 0;
          const noteDuration = totalDuration / frequencies.length;

          const playNote = () => {
            if (noteIndex >= frequencies.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequencies[noteIndex];
            oscillator.type = 'sawtooth';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + noteDuration);

            oscillator.onended = () => {
              noteIndex++;
              if (noteIndex < frequencies.length) {
                setTimeout(playNote, 50);
              } else {
                resolve();
              }
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createAscendingSound(frequencies: number[], noteDuration: number): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          let noteIndex = 0;

          const playNote = () => {
            if (noteIndex >= frequencies.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequencies[noteIndex];
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + noteDuration);

            oscillator.onended = () => {
              noteIndex++;
              if (noteIndex < frequencies.length) {
                setTimeout(playNote, 30);
              } else {
                resolve();
              }
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createSnapSound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
          oscillator.type = 'triangle';

          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          oscillator.onended = () => resolve();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createCardFlipSound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.05);
          oscillator.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 0.1);
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, audioContext.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
          oscillator.onended = () => resolve();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createMatchSound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const frequencies = [523, 659, 784]; // Do-Mi-Sol
          let resolved = false;

          frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);

            if (index === frequencies.length - 1) {
              oscillator.onended = () => {
                if (!resolved) {
                  resolved = true;
                  resolve();
                }
              };
            }
          });
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createShuffleSound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          let soundCount = 0;
          const totalSounds = 8;

          const playRandomBeep = () => {
            if (soundCount >= totalSounds) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 200 + Math.random() * 400; // Frecuencia aleatoria
            oscillator.type = 'square';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.05);

            oscillator.onended = () => {
              soundCount++;
              setTimeout(playRandomBeep, 30);
            };
          };

          playRandomBeep();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createCelebrationSound(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const celebrationNotes = [523, 659, 784, 1047, 1319, 1568]; // Do-Mi-Sol-Do-Mi-Sol octava alta
          let noteIndex = 0;

          const playNote = () => {
            if (noteIndex >= celebrationNotes.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = celebrationNotes[noteIndex];
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.25);

            oscillator.onended = () => {
              noteIndex++;
              setTimeout(playNote, 80);
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createVictoryMelody(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const melody = [523, 659, 784, 659, 523, 659, 784, 1047]; // Melodía más elaborada
          const durations = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4];
          let noteIndex = 0;

          const playNote = () => {
            if (noteIndex >= melody.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = melody[noteIndex];
            oscillator.type = 'triangle';

            const duration = durations[noteIndex];
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);

            oscillator.onended = () => {
              noteIndex++;
              setTimeout(playNote, 50);
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  private createVictoryFanfare(): HTMLAudioElement {
    const mockAudio = {
      volume: this.volume,
      currentTime: 0,
      play: () => {
        if (!this.isEnabled) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const fanfare = [523, 523, 523, 659, 784, 784, 784, 1047]; // Fanfarria clásica
          const durations = [0.15, 0.15, 0.3, 0.15, 0.15, 0.15, 0.3, 0.5];
          let noteIndex = 0;

          const playNote = () => {
            if (noteIndex >= fanfare.length) {
              resolve();
              return;
            }

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = fanfare[noteIndex];
            oscillator.type = 'sawtooth';

            const duration = durations[noteIndex];
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.9, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);

            oscillator.onended = () => {
              noteIndex++;
              setTimeout(playNote, 30);
            };
          };

          playNote();
        });
      }
    } as HTMLAudioElement;

    return mockAudio;
  }

  // Métodos públicos originales
  playCorrectMove(): void {
    this.sounds.correctMove?.play().catch(e => console.warn('Error reproduciendo sonido correcto:', e));
  }

  playIncorrectMove(): void {
    this.sounds.incorrectMove?.play().catch(e => console.warn('Error reproduciendo sonido incorrecto:', e));
  }

  playGameComplete(): void {
    this.sounds.gameComplete?.play().catch(e => console.warn('Error reproduciendo sonido de victoria:', e));
  }

  playTimeWarning(): void {
    this.sounds.timeWarning?.play().catch(e => console.warn('Error reproduciendo sonido de advertencia:', e));
  }

  playButtonClick(): void {
    this.sounds.buttonClick?.play().catch(e => console.warn('Error reproduciendo sonido de click:', e));
  }

  // Nuevos métodos generales
  playGameStart(): void {
    this.sounds.gameStart?.play().catch(e => console.warn('Error reproduciendo sonido de inicio:', e));
  }

  playCountdown(): void {
    this.sounds.countdown?.play().catch(e => console.warn('Error reproduciendo sonido de cuenta regresiva:', e));
  }

  playTimeUp(): void {
    this.sounds.timeUp?.play().catch(e => console.warn('Error reproduciendo sonido de tiempo agotado:', e));
  }

  playLevelUp(): void {
    this.sounds.levelUp?.play().catch(e => console.warn('Error reproduciendo sonido de nivel completado:', e));
  }

  playPowerUp(): void {
    this.sounds.powerUp?.play().catch(e => console.warn('Error reproduciendo sonido de power-up:', e));
  }

  // Métodos para Hangman
  playHangmanWrongLetter(): void {
    this.hangmanSounds.wrongLetter?.play().catch(e => console.warn('Error reproduciendo sonido de letra incorrecta:', e));
  }

  playHangmanCorrectLetter(): void {
    this.hangmanSounds.correctLetter?.play().catch(e => console.warn('Error reproduciendo sonido de letra correcta:', e));
  }

  playHangmanWordComplete(): void {
    this.hangmanSounds.wordComplete?.play().catch(e => console.warn('Error reproduciendo sonido de palabra completa:', e));
  }
  playHangmanGameOver(): void {
    this.hangmanSounds.gameOver?.play().catch(e => console.warn('Error reproduciendo sonido de juego terminado:', e));
  }
  playHangmanDrawPart(): void {
    this.hangmanSounds.drawPart?.play().catch(e => console.warn('Error reproduciendo sonido de dibujar parte:', e));
  }
  // Métodos para Puzzle
  playPuzzlePiecePlace(): void {
    this.puzzleSounds.piecePlace?.play().catch(e => console.warn('Error reproduciendo sonido de pieza colocada:', e));
  }
  playPuzzlePieceWrongPlace(): void {
    this.puzzleSounds.pieceWrongPlace?.play().catch(e => console.warn('Error reproduciendo sonido de pieza incorrecta:', e));
  }
  playPuzzlePieceSnap(): void {
    this.puzzleSounds.pieceSnap?.play().catch(e => console.warn('Error reproduciendo sonido de pieza encajada:', e));
  }
  playPuzzleComplete(): void {
    this.puzzleSounds.puzzleComplete?.play().catch(e => console.warn('Error reproduciendo sonido de puzzle completo:', e));
  }
  // Métodos faltantes para Puzzle
  playPuzzleShuffle(): void {
    this.puzzleSounds.shuffle?.play().catch(e => console.warn('Error reproduciendo sonido de mezcla:', e));
  }

  // Métodos para Word Search
  playWordSearchWordFound(): void {
    this.wordSearchSounds.wordFound?.play().catch(e => console.warn('Error reproduciendo sonido de palabra encontrada:', e));
  }

  playWordSearchWordNotFound(): void {
    this.wordSearchSounds.wordNotFound?.play().catch(e => console.warn('Error reproduciendo sonido de palabra no encontrada:', e));
  }

  playWordSearchAllWordsFound(): void {
    this.wordSearchSounds.allWordsFound?.play().catch(e => console.warn('Error reproduciendo sonido de todas las palabras encontradas:', e));
  }

  playWordSearchLetterSelect(): void {
    this.wordSearchSounds.letterSelect?.play().catch(e => console.warn('Error reproduciendo sonido de selección de letra:', e));
  }

  playWordSearchWordHighlight(): void {
    this.wordSearchSounds.wordHighlight?.play().catch(e => console.warn('Error reproduciendo sonido de resaltado de palabra:', e));
  }

  // Métodos para Memory Game
  playMemoryCardFlip(): void {
    this.memorySounds.cardFlip?.play().catch(e => console.warn('Error reproduciendo sonido de voltear carta:', e));
  }

  playMemoryCardMatch(): void {
    this.memorySounds.cardMatch?.play().catch(e => console.warn('Error reproduciendo sonido de cartas coincidentes:', e));
  }

  playMemoryCardMismatch(): void {
    this.memorySounds.cardMismatch?.play().catch(e => console.warn('Error reproduciendo sonido de cartas no coincidentes:', e));
  }

  playMemoryAllMatched(): void {
    this.memorySounds.allMatched?.play().catch(e => console.warn('Error reproduciendo sonido de todas las cartas emparejadas:', e));
  }

  playMemoryCardHide(): void {
    this.memorySounds.cardHide?.play().catch(e => console.warn('Error reproduciendo sonido de ocultar carta:', e));
  }

  // Métodos de configuración y utilidad
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Actualizar volumen de todos los sonidos
    Object.values(this.sounds).forEach(sound => {
      if (sound) sound.volume = this.volume;
    });
    
    Object.values(this.hangmanSounds).forEach(sound => {
      if (sound) sound.volume = this.volume;
    });
    
    Object.values(this.puzzleSounds).forEach(sound => {
      if (sound) sound.volume = this.volume;
    });
    
    Object.values(this.wordSearchSounds).forEach(sound => {
      if (sound) sound.volume = this.volume;
    });
    
    Object.values(this.memorySounds).forEach(sound => {
      if (sound) sound.volume = this.volume;
    });
  }

  getVolume(): number {
    return this.volume;
  }

  enableSound(): void {
    this.isEnabled = true;
  }

  disableSound(): void {
    this.isEnabled = false;
  }

  toggleSound(): void {
    this.isEnabled = !this.isEnabled;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Método para probar todos los sonidos (útil para debugging)
  testAllSounds(): void {
    
    // Sonidos generales
    setTimeout(() => this.playButtonClick(), 100);
    setTimeout(() => this.playCorrectMove(), 300);
    setTimeout(() => this.playIncorrectMove(), 500);
    setTimeout(() => this.playGameStart(), 700);
    setTimeout(() => this.playLevelUp(), 900);
    setTimeout(() => this.playGameComplete(), 1100);
    
    // Sonidos de Hangman
    setTimeout(() => this.playHangmanCorrectLetter(), 1300);
    setTimeout(() => this.playHangmanWrongLetter(), 1500);
    setTimeout(() => this.playHangmanWordComplete(), 1700);
    
    // Sonidos de Puzzle
    setTimeout(() => this.playPuzzlePiecePlace(), 1900);
    setTimeout(() => this.playPuzzlePieceSnap(), 2100);
    setTimeout(() => this.playPuzzleComplete(), 2300);
    
    // Sonidos de Word Search
    setTimeout(() => this.playWordSearchLetterSelect(), 2500);
    setTimeout(() => this.playWordSearchWordFound(), 2700);
    setTimeout(() => this.playWordSearchAllWordsFound(), 2900);
    
    // Sonidos de Memory
    setTimeout(() => this.playMemoryCardFlip(), 3100);
    setTimeout(() => this.playMemoryCardMatch(), 3300);
    setTimeout(() => this.playMemoryAllMatched(), 3500);
  }

  // Método para obtener información del estado del servicio
  getServiceInfo(): {
    isEnabled: boolean;
    volume: number;
    totalSounds: number;
    soundsByGame: {
      general: number;
      hangman: number;
      puzzle: number;
      wordSearch: number;
      memory: number;
    };
  } {
    return {
      isEnabled: this.isEnabled,
      volume: this.volume,
      totalSounds: Object.keys(this.sounds).length + 
                   Object.keys(this.hangmanSounds).length + 
                   Object.keys(this.puzzleSounds).length + 
                   Object.keys(this.wordSearchSounds).length + 
                   Object.keys(this.memorySounds).length,
      soundsByGame: {
        general: Object.keys(this.sounds).length,
        hangman: Object.keys(this.hangmanSounds).length,
        puzzle: Object.keys(this.puzzleSounds).length,
        wordSearch: Object.keys(this.wordSearchSounds).length,
        memory: Object.keys(this.memorySounds).length
      }
    };
  }
}