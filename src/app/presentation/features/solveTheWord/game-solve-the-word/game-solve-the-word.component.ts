import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WordCell {
  letter: string;
  isFound: boolean;
  position: { row: number; col: number };
}

interface Word {
  text: string;
  found: boolean;
  positions?: { row: number; col: number }[];
}

@Component({
  selector: 'app-game-solve-the-word',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-solve-the-word.component.html',
  styleUrl: './game-solve-the-word.component.css'
})
export class GameSolveTheWordComponent implements OnInit {
  grid: WordCell[][] = [];
  words: Word[] = [
    { text: 'ELEFANTE', found: false },
    { text: 'JIRAFA', found: false },
    { text: 'TIGRE', found: false },
    { text: 'LEON', found: false },
    { text: 'CEBRA', found: false },
    { text: 'MONO', found: false },
    { text: 'HIPOPOTAMO', found: false }
  ];

  gridSize = 12;
  wordsFound = 0;
  totalWords = this.words.length;
  timeLeft = 347; // 5:47 en segundos
  timer: any;
  selection: WordCell[] = [];
  directions = [
    { row: -1, col: 0 },  // arriba
    { row: -1, col: 1 },  // arriba-derecha
    { row: 0, col: 1 },   // derecha
    { row: 1, col: 1 },   // abajo-derecha
    { row: 1, col: 0 },   // abajo
    { row: 1, col: -1 },  // abajo-izquierda
    { row: 0, col: -1 },  // izquierda
    { row: -1, col: -1 }  // arriba-izquierda
  ];

  ngOnInit() {
    this.initializeGrid();
    this.placeWordsOnGrid();
    this.fillRemainingCells();
    this.startTimer();
  }

  initializeGrid() {
    this.grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      const row: WordCell[] = [];
      for (let j = 0; j < this.gridSize; j++) {
        row.push({
          letter: '',
          isFound: false,
          position: { row: i, col: j }
        });
      }
      this.grid.push(row);
    }
  }

  placeWordsOnGrid() {
    for (const word of this.words) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;

        // Seleccionar una posición y dirección aleatoria
        const startRow = Math.floor(Math.random() * this.gridSize);
        const startCol = Math.floor(Math.random() * this.gridSize);
        const directionIndex = Math.floor(Math.random() * this.directions.length);
        const direction = this.directions[directionIndex];

        // Comprobar si la palabra cabe en esa dirección
        if (this.canPlaceWord(word.text, startRow, startCol, direction)) {
          const positions = [];

          // Colocar la palabra
          for (let i = 0; i < word.text.length; i++) {
            const row = startRow + i * direction.row;
            const col = startCol + i * direction.col;
            this.grid[row][col].letter = word.text[i];
            positions.push({ row, col });
          }

          word.positions = positions;
          placed = true;
        }
      }

      // Si no se pudo colocar después de 100 intentos, colocarla en posiciones disponibles
      if (!placed) {
        this.placeFallbackWord(word);
      }
    }
  }

  canPlaceWord(word: string, startRow: number, startCol: number, direction: { row: number; col: number }) {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * direction.row;
      const col = startCol + i * direction.col;

      // Verificar que la posición esté dentro de los límites de la cuadrícula
      if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
        return false;
      }

      // Verificar que la celda esté vacía o tenga la misma letra
      if (this.grid[row][col].letter !== '' && this.grid[row][col].letter !== word[i]) {
        return false;
      }
    }
    return true;
  }

  placeFallbackWord(word: Word) {
    // Esta es una solución de respaldo por si no se puede colocar la palabra
    // Simplemente la colocamos horizontalmente donde encontremos espacio
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col <= this.gridSize - word.text.length; col++) {
        let canPlace = true;
        for (let i = 0; i < word.text.length; i++) {
          if (this.grid[row][col + i].letter !== '' && this.grid[row][col + i].letter !== word.text[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          const positions = [];
          for (let i = 0; i < word.text.length; i++) {
            this.grid[row][col + i].letter = word.text[i];
            positions.push({ row, col: col + i });
          }
          word.positions = positions;
          return;
        }
      }
    }
  }

  fillRemainingCells() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j].letter === '') {
          const randomIndex = Math.floor(Math.random() * letters.length);
          this.grid[i][j].letter = letters[randomIndex];
        }
      }
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        // Manejo de fin de tiempo
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onCellMouseDown(cell: WordCell) {
    this.selection = [cell];
    cell.isFound = true;
  }

  onCellMouseOver(cell: WordCell) {
    if (this.selection.length > 0) {
      // Verificar que la celda esté alineada con la selección actual
      if (this.isAligned(this.selection[0], cell, this.selection.length)) {
        // Evitar duplicados
        if (!this.selection.some(c => c.position.row === cell.position.row && c.position.col === cell.position.col)) {
          this.selection.push(cell);
          cell.isFound = true;
        }
      }
    }
  }

  onCellMouseUp() {
    const selectedWord = this.selection.map(cell => cell.letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    // Comprobar si la palabra seleccionada está en la lista
    const foundWord = this.words.find(word =>
      word.text === selectedWord || word.text === reversedWord
    );

    if (foundWord && !foundWord.found) {
      foundWord.found = true;
      this.wordsFound++;

      // Mantener las celdas marcadas como encontradas
      if (foundWord.positions) {
        for (const pos of foundWord.positions) {
          this.grid[pos.row][pos.col].isFound = true;
        }
      }
    } else {
      // Si no se encontró la palabra, resetear las celdas
      for (const cell of this.selection) {
        // Solo restablecer si la celda no pertenece a una palabra ya encontrada
        if (!this.cellBelongsToFoundWord(cell)) {
          cell.isFound = false;
        }
      }
    }

    this.selection = [];

    // Comprobar si se han encontrado todas las palabras
    if (this.wordsFound === this.totalWords) {
      clearInterval(this.timer);
      // Manejo de fin de juego
    }
  }

  isAligned(firstCell: WordCell, currentCell: WordCell, length: number): boolean {
    for (const direction of this.directions) {
      const expectedRow = firstCell.position.row + (length - 1) * direction.row;
      const expectedCol = firstCell.position.col + (length - 1) * direction.col;

      if (expectedRow === currentCell.position.row && expectedCol === currentCell.position.col) {
        return true;
      }
    }
    return false;
  }

  cellBelongsToFoundWord(cell: WordCell): boolean {
    for (const word of this.words) {
      if (word.found && word.positions) {
        for (const pos of word.positions) {
          if (pos.row === cell.position.row && pos.col === cell.position.col) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
