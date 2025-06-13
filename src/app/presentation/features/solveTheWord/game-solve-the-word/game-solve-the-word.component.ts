import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GameConfigurationService, GameConfiguration } from '../../../../core/infrastructure/api/GameSetting/game-configuration.service';

interface WordCell {
  letter: string;
  isFound: boolean;
  position: { row: number; col: number };
}

interface Word {
  text: string;
  found: boolean;
  positions?: { row: number; col: number }[];
  orientation?: string;
}

@Component({
  selector: 'app-game-solve-the-word',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-solve-the-word.component.html',
  styleUrl: './game-solve-the-word.component.css'
})
export class GameSolveTheWordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private gameConfigService = inject(GameConfigurationService);

  grid: WordCell[][] = [];
  words: Word[] = [];
  gridRows = 12;
  gridCols = 12;
  wordsFound = 0;
  totalWords = 0;
  timeLeft = 347; // default
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
  isSelecting = false;
  loading = true;
  error = '';
  title = '';
  description = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    if (id) {
      this.loading = true;
      this.gameConfigService.getGameConfiguration(id).subscribe({
        next: (response) => {
          console.log('Respuesta completa:', response); // Para debug
          
          if ((response.success || response.data) && response.data) {
            this.title = response.data.title;
            this.description = response.data.description;
            
            const timeSetting = response.data.settings?.find((s: any) => 
              s.key.toLowerCase() === 'time_limit'
            );
            this.timeLeft = timeSetting ? parseInt(timeSetting.value, 10) : 347;
            
            const rows = response.data.game_data?.rows || 12;
            const cols = response.data.game_data?.columns || rows || 12;
            this.gridRows = rows;
            this.gridCols = cols;
            
            const wordsArr = response.data.game_data?.words || [];
            this.words = wordsArr.map((w: any) => ({ 
              text: w.word.toUpperCase(), 
              found: false, 
              orientation: w.orientation 
            }));
            this.totalWords = this.words.length;
            this.wordsFound = 0;
            
            this.initializeGrid();
            this.placeWordsOnGrid();
            this.fillRemainingCells();
            this.startTimer();
            this.loading = false;
          } else {
            this.error = response.message || 'No se pudo cargar la configuración del juego';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error en suscripción:', err);
          this.error = 'Error al cargar la configuración del juego';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No se proporcionó un ID de juego válido';
      this.loading = false;
    }
  }

  originalTimeLimit = 347;

  initializeGrid() {
    this.grid = [];
    for (let i = 0; i < this.gridRows; i++) {
      const row: WordCell[] = [];
      for (let j = 0; j < this.gridCols; j++) {
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
    console.log('Colocando palabras:', this.words); // Debug
    
    for (const word of this.words) {
      let placed = false;
      let attempts = 0;

      // ✅ MAPEAR ORIENTACIONES DEL JSON A DIRECCIONES CORRECTAS
      const orientationMap: { [key: string]: { row: number; col: number } } = {
        'HL': { row: 0, col: 1 },   // Horizontal Left to Right (normal)
        'HR': { row: 0, col: 1 },   // Horizontal Right (igual que HL)
        'VU': { row: 1, col: 0 },   // Vertical Up to Down (normal)
        'VD': { row: 1, col: 0 },   // Vertical Down (igual que VU)
        'DU': { row: 1, col: 1 },   // Diagonal Down-Right
        'DD': { row: 1, col: 1 }    // Diagonal Down (igual que DU)
      };

      const direction = orientationMap[word.orientation || 'HL'] || { row: 0, col: 1 };

      while (!placed && attempts < 100) {
        attempts++;

        // ✅ CALCULAR POSICIÓN INICIAL CONSIDERANDO EL TAMAÑO DE LA PALABRA
        const maxStartRow = direction.row === 0 ? this.gridRows - 1 : 
                          this.gridRows - word.text.length;
        const maxStartCol = direction.col === 0 ? this.gridCols - 1 : 
                          this.gridCols - word.text.length;

        const startRow = Math.floor(Math.random() * (maxStartRow + 1));
        const startCol = Math.floor(Math.random() * (maxStartCol + 1));

        if (this.canPlaceWord(word.text, startRow, startCol, direction)) {
          const positions = [];

          // ✅ COLOCAR CADA LETRA DE LA PALABRA
          for (let i = 0; i < word.text.length; i++) {
            const row = startRow + i * direction.row;
            const col = startCol + i * direction.col;
            this.grid[row][col].letter = word.text[i];
            positions.push({ row, col });
          }

          word.positions = positions;
          placed = true;
          console.log(`Palabra "${word.text}" colocada en:`, positions); // Debug
        }
      }

      if (!placed) {
        console.log(`No se pudo colocar "${word.text}", usando fallback`); // Debug
        this.placeFallbackWord(word);
      }
    }
  }

  canPlaceWord(word: string, startRow: number, startCol: number, direction: { row: number; col: number }): boolean {
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * direction.row;
      const col = startCol + i * direction.col;

      // ✅ VERIFICAR LÍMITES DE LA GRILLA
      if (row < 0 || row >= this.gridRows || col < 0 || col >= this.gridCols) {
        return false;
      }

      // ✅ VERIFICAR QUE LA CELDA ESTÉ VACÍA O TENGA LA MISMA LETRA
      const currentLetter = this.grid[row][col].letter;
      if (currentLetter !== '' && currentLetter !== word[i]) {
        return false;
      }
    }
    return true;
  }


 placeFallbackWord(word: Word) {
    console.log(`Colocando palabra fallback: ${word.text}`);
    
    // ✅ BUSCAR PRIMERA POSICIÓN HORIZONTAL DISPONIBLE
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col <= this.gridCols - word.text.length; col++) {
        let canPlace = true;
        
        // Verificar si se puede colocar horizontalmente
        for (let i = 0; i < word.text.length; i++) {
          const currentLetter = this.grid[row][col + i].letter;
          if (currentLetter !== '' && currentLetter !== word.text[i]) {
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
          console.log(`Palabra fallback "${word.text}" colocada en:`, positions);
          return;
        }
      }
    }
    
    // ✅ SI NO SE PUEDE COLOCAR HORIZONTALMENTE, INTENTAR VERTICALMENTE
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row <= this.gridRows - word.text.length; row++) {
        let canPlace = true;
        
        for (let i = 0; i < word.text.length; i++) {
          const currentLetter = this.grid[row + i][col].letter;
          if (currentLetter !== '' && currentLetter !== word.text[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          const positions = [];
          for (let i = 0; i < word.text.length; i++) {
            this.grid[row + i][col].letter = word.text[i];
            positions.push({ row: row + i, col });
          }
          word.positions = positions;
          console.log(`Palabra fallback vertical "${word.text}" colocada en:`, positions);
          return;
        }
      }
    }
  }

  fillRemainingCells() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < this.gridRows; i++) {
      for (let j = 0; j < this.gridCols; j++) {
        if (this.grid[i][j].letter === '') {
          const randomIndex = Math.floor(Math.random() * letters.length);
          this.grid[i][j].letter = letters[randomIndex];
        }
      }
    }
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
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
    this.wordsFound = 0;
    
    // ✅ RESTAURAR EL TIEMPO ORIGINAL CONFIGURADO
    const timeSetting = this.gameConfigService.getGameConfiguration(
      Number(this.route.snapshot.params['id'])
    );
    // Alternativamente, guardar el tiempo original en una variable
    
    this.selection = [];
    this.isSelecting = false;

    this.words.forEach(word => word.found = false);

    this.initializeGrid();
    this.placeWordsOnGrid();
    this.fillRemainingCells();

    if (this.timer) {
      clearInterval(this.timer);
    }
    this.startTimer();
  }
}
