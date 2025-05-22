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

  isSelecting = false;

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
    this.isSelecting = true;
    this.selection = [cell];
  }

  onCellMouseOver(cell: WordCell) {
    if (!this.isSelecting) return;

    // Si es la primera celda, simplemente la agregamos
    if (this.selection.length === 0) {
      this.selection.push(cell);
      return;
    }

    const firstCell = this.selection[0];
    const lastCell = this.selection[this.selection.length - 1];

    // Calcular dirección entre la primera y última celda seleccionada
    const direction = this.calculateDirection(firstCell, lastCell);

    // Verificar si la nueva celda continúa en la misma dirección
    if (this.isInDirection(lastCell, cell, direction)) {
      // Verificar que no esté ya seleccionado
      if (!this.selection.some(c =>
        c.position.row === cell.position.row &&
        c.position.col === cell.position.col)) {
        this.selection.push(cell);
      }
    } else {
      // Si no está en la misma dirección, verificar si forma nueva dirección con la primera celda
      const newDirection = this.calculateDirection(firstCell, cell);
      if (this.isValidDirection(newDirection) &&
        Math.abs(cell.position.row - firstCell.position.row) ===
        Math.abs(cell.position.col - firstCell.position.col) ||
        cell.position.row === firstCell.position.row ||
        cell.position.col === firstCell.position.col) {
        // Reiniciar selección con la nueva dirección válida
        this.selection = [firstCell, cell];
      }
    }
  }

  private calculateDirection(start: WordCell, end: WordCell): { row: number, col: number } {
    const rowDiff = end.position.row - start.position.row;
    const colDiff = end.position.col - start.position.col;

    return {
      row: rowDiff !== 0 ? rowDiff / Math.abs(rowDiff) : 0,
      col: colDiff !== 0 ? colDiff / Math.abs(colDiff) : 0
    };
  }

  private isInDirection(from: WordCell, to: WordCell, direction: { row: number, col: number }): boolean {
    return to.position.row === from.position.row + direction.row &&
      to.position.col === from.position.col + direction.col;
  }

  private isValidDirection(direction: { row: number, col: number }): boolean {
    // Todas las direcciones son válidas (horizontal, vertical y diagonal)
    return Math.abs(direction.row) <= 1 && Math.abs(direction.col) <= 1;
  }


  onCellMouseUp() {
    this.isSelecting = false;

    if (this.selection.length < 2) {
      this.selection = [];
      return;
    }

    const selectedWord = this.selection.map(cell => cell.letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    // Buscar palabra en ambas direcciones
    const foundWord = this.words.find(word =>
      !word.found &&
      (word.text === selectedWord || word.text === reversedWord)
    );

    if (foundWord) {
      foundWord.found = true;
      this.wordsFound++;

      // Marcar todas las celdas de la palabra como encontradas
      for (const cell of this.selection) {
        cell.isFound = true;
      }

      // Guardar las posiciones para referencia futura
      foundWord.positions = this.selection.map(cell => ({
        row: cell.position.row,
        col: cell.position.col
      }));
    } else {
      // Si no es una palabra válida, desmarcar las celdas
      for (const cell of this.selection) {
        if (!this.cellBelongsToFoundWord(cell)) {
          cell.isFound = false;
        }
      }
    }

    this.selection = [];

    // Comprobar si se completó el juego
    if (this.wordsFound === this.totalWords) {
      clearInterval(this.timer);
    }
  }

  onCellMouseLeave() {
    if (!this.isSelecting) {
      this.selection = [];
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


  resetGame() {
    // Reiniciar todas las variables del juego
    this.wordsFound = 0;
    this.timeLeft = 347;
    this.selection = [];
    this.isSelecting = false;

    // Reiniciar el estado de las palabras
    this.words.forEach(word => word.found = false);

    // Reiniciar el tablero
    this.initializeGrid();
    this.placeWordsOnGrid();
    this.fillRemainingCells();

    // Reiniciar el temporizador
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.startTimer();
  }
}
