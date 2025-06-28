import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import { GameConfiguration, SolveTheWordWord, GameSetting } from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import { RatingModalComponent } from '../../../shared/rating-modal/rating-modal.component';
import { RatingService } from '../../../../core/infrastructure/service/rating.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
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
  imports: [CommonModule, RatingModalComponent],
  templateUrl: './game-solve-the-word.component.html',
  styleUrl: './game-solve-the-word.component.css',
})
export class GameSolveTheWordComponent extends BaseAuthenticatedComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameConfigService = inject(GameConfigurationService);
  private ratingService = inject(RatingService);

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
    { row: -1, col: 0 }, // arriba
    { row: -1, col: 1 }, // arriba-derecha
    { row: 0, col: 1 }, // derecha
    { row: 1, col: 1 }, // abajo-derecha
    { row: 1, col: 0 }, // abajo
    { row: 1, col: -1 }, // abajo-izquierda
    { row: 0, col: -1 }, // izquierda
    { row: -1, col: -1 }, // arriba-izquierda
  ];
  isSelecting = false;
  loading = true;
  error = '';
  title = '';
  description = '';
  isCompact = false;
  fontFamily = 'Arial';
  backgroundColor = '#fff';
  fontColor = '#000';
  headerExpanded: boolean = false;

  // Rating properties
  mostrarModalRating = false;
  gameInstanceId = 0;
  hasUserRated = false;

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    super.ngOnDestroy();
  }

  onAuthenticationReady(userId: number): void {
    const id = Number(this.route.snapshot.params['id']);
    if (id && !isNaN(id)) {
      this.cargarConfiguracionJuego(id);
    } else {
      this.error = 'No se proporcionó un ID de juego válido';
      this.loading = false;
    }
  }

  private cargarConfiguracionJuego(id: number): void {
    this.loading = true;
    this.error = '';

    this.gameConfigService.getGameConfiguration(id).subscribe({
      next: (response: { success: boolean; data: GameConfiguration; message?: string }) => {
        if (response.success && response.data) {
          this.gameInstanceId = response.data.game_instance_id; // Guardar el gameInstanceId
          this.aplicarConfiguracion(response.data);
          this.iniciarJuego();
          this.checkIfUserHasRated(); // Verificar si ya valoró el juego
        } else {
          this.error = response.message || 'No se pudo cargar la configuración del juego';
        }
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Error cargando configuración:', err);
        this.error = 'Error al cargar la configuración del juego';
        this.loading = false;
      },
    });
  }

  private aplicarConfiguracion(data: GameConfiguration): void {
    this.title = data.game_name;
    this.description = data.game_description;

    // Aplicar configuraciones desde settings (con validación)
    if (data.settings && Array.isArray(data.settings)) {
      const getSetting = (key: string) => data.settings.find((s: GameSetting) => s.key.toLowerCase() === key)?.value;
      this.timeLeft = parseInt(getSetting('time_limit') || '347', 10);
      this.fontFamily = getSetting('font_family') || 'Arial';
      this.backgroundColor = getSetting('background_color') || '#fff';
      this.fontColor = getSetting('font_color') || '#000';
      this.originalTimeLimit = this.timeLeft;
    }

    // Palabras y orientaciones
    const solveArr: SolveTheWordWord[] = data.solve_the_word || [];
    this.words = solveArr.map((w) => ({
      text: w.word.toUpperCase(),
      found: false,
      orientation: w.orientation,
    }));
    this.totalWords = this.words.length;
    this.wordsFound = 0;

    // Tamaño de grilla dinámico
    const maxWordLen = this.words.reduce((max, w) => Math.max(max, w.text.length), 0);
    this.gridRows = Math.max(12, maxWordLen + 2, this.words.length + 2);
    this.gridCols = Math.max(12, maxWordLen + 2, this.words.length + 2);
  }

  private iniciarJuego(): void {
    this.updateGridSize();
    this.initializeGrid();
    this.placeWordsOnGrid();
    this.fillRemainingCells();
    this.startTimer();
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
          position: { row: i, col: j },
        });
      }
      this.grid.push(row);
    }
  }

  private showWinAlert() {
    Swal.fire({
      icon: 'success',
      title: '🏆 ¡Increíble trabajo!',
      html: `
        <div style="font-family: 'Arial', sans-serif; text-align: center;">
          <div style="font-size: 80px; margin: 20px 0;">�</div>
          <p style="font-size: 20px; color: #2e7d32; margin: 15px 0; font-weight: bold;">
            ¡Encontraste todas las palabras!
          </p>
          <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 20px; border-radius: 15px; margin: 15px 0;">
            <p style="font-size: 18px; color: #1b5e20; margin: 0;">
              ⏱️ Tiempo: <strong>${this.formatTime(347 - this.timeLeft)}</strong>
            </p>
          </div>
          <p style="font-size: 16px; color: #555; margin: 10px 0;">
            🎮 ¿Quieres una nueva aventura?
          </p>
        </div>
      `,
      background: 'linear-gradient(135deg, #e8f5e8, #f1f8e9)',
      confirmButtonColor: '#4caf50',
      confirmButtonText: '🚀 ¡Jugar de nuevo!',
      showCancelButton: true,
      cancelButtonText: '🏠 Continuar',
      cancelButtonColor: '#78909c',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button',
        cancelButton: 'kid-friendly-button-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetGame();
      }
      // Mostrar modal de valoración después de la victoria
      setTimeout(() => this.mostrarModalDeValoracion(), 500);
    });
  }

  private showTimeUpAlert() {
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
              📝 Encontraste <strong>${this.wordsFound}</strong> de <strong>${this.totalWords}</strong> palabras
            </p>
          </div>
          <p style="font-size: 16px; color: #555; margin: 10px 0;">
            🚀 ¡Puedes hacerlo mejor!
          </p>
        </div>
      `,
      background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
      confirmButtonColor: '#ff9800',
      confirmButtonText: '� ¡Intentar de nuevo!',
      showCancelButton: true,
      cancelButtonText: '📖 Ver palabras',
      cancelButtonColor: '#78909c',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button',
        cancelButton: 'kid-friendly-button-secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetGame();
      }
      // Mostrar modal de valoración después del tiempo agotado
      setTimeout(() => this.mostrarModalDeValoracion(), 500);
    });
  }

  private showErrorAlert(message: string) {
    Swal.fire({
      icon: 'error',
      title: '😔 ¡Ups! Algo salió mal',
      html: `
        <div style="font-family: 'Arial', sans-serif; text-align: center;">
          <div style="font-size: 60px; margin: 20px 0;">🤖</div>
          <p style="font-size: 18px; color: #d32f2f; margin: 15px 0; font-weight: 600;">
            ${message}
          </p>
          <div style="background: linear-gradient(135deg, #ffebee, #fce4ec); padding: 15px; border-radius: 15px; margin: 15px 0;">
            <p style="font-size: 16px; color: #c62828; margin: 0;">
              💪 ¡No te preocupes, lo solucionaremos!
            </p>
          </div>
        </div>
      `,
      background: 'linear-gradient(135deg, #ffebee, #fce4ec)',
      confirmButtonColor: '#e53935',
      confirmButtonText: '🔄 Reintentar',
      allowOutsideClick: false,
      customClass: {
        popup: 'animated-popup',
        confirmButton: 'kid-friendly-button'
      }
    }).then(() => {
      this.resetGame();
    });
  }

  placeWordsOnGrid() {
    console.log('Colocando palabras:', this.words); // Debug

    for (const word of this.words) {
      let placed = false;
      let attempts = 0;

      // ✅ MAPEAR ORIENTACIONES DEL JSON A DIRECCIONES CORRECTAS
      const orientationMap: { [key: string]: { row: number; col: number } } = {
        HL: { row: 0, col: 1 }, // Horizontal Left to Right (normal)
        HR: { row: 0, col: 1 }, // Horizontal Right (igual que HL)
        VU: { row: 1, col: 0 }, // Vertical Up to Down (normal)
        VD: { row: 1, col: 0 }, // Vertical Down (igual que VU)
        DU: { row: 1, col: 1 }, // Diagonal Down-Right
        DD: { row: 1, col: 1 }, // Diagonal Down (igual que DU)
      };

      const direction = orientationMap[word.orientation || 'HL'] || {
        row: 0,
        col: 1,
      };

      while (!placed && attempts < 100) {
        attempts++;

        // ✅ CALCULAR POSICIÓN INICIAL CONSIDERANDO EL TAMAÑO DE LA PALABRA
        const maxStartRow =
          direction.row === 0
            ? this.gridRows - 1
            : this.gridRows - word.text.length;
        const maxStartCol =
          direction.col === 0
            ? this.gridCols - 1
            : this.gridCols - word.text.length;

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

  canPlaceWord(
    word: string,
    startRow: number,
    startCol: number,
    direction: { row: number; col: number }
  ): boolean {
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
          console.log(
            `Palabra fallback "${word.text}" colocada en:`,
            positions
          );
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
          console.log(
            `Palabra fallback vertical "${word.text}" colocada en:`,
            positions
          );
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
        this.showTimeUpAlert();
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

    if (
      this.selection.length === 0 ||
      (this.selection.length === 1 && this.selection[0] === cell)
    ) {
      if (!this.selection.includes(cell)) {
        this.selection = [cell];
      }
      return;
    }

    const firstCell = this.selection[0];

    const rowDiff = cell.position.row - firstCell.position.row;
    const colDiff = cell.position.col - firstCell.position.col;

    const isHorizontal = rowDiff === 0;
    const isVertical = colDiff === 0;
    const isDiagonal = Math.abs(rowDiff) === Math.abs(colDiff);

    if (isHorizontal || isVertical || isDiagonal) {
      this.selection = [firstCell];

      const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

      let currentRow = firstCell.position.row + stepRow;
      let currentCol = firstCell.position.col + stepCol;

      while (
        currentRow !== cell.position.row + stepRow ||
        currentCol !== cell.position.col + stepCol
      ) {
        if (
          currentRow >= 0 &&
          currentRow < this.gridRows &&
          currentCol >= 0 &&
          currentCol < this.gridCols
        ) {
          this.selection.push(this.grid[currentRow][currentCol]);
        }

        currentRow += stepRow;
        currentCol += stepCol;
      }
    }
  }

  updateGridSize() {
    const size = Math.max(this.gridRows, this.gridCols);
    this.gridRows = size;
    this.gridCols = size;
  }

  private calculateDirection(
    start: WordCell,
    end: WordCell
  ): { row: number; col: number } {
    const rowDiff = end.position.row - start.position.row;
    const colDiff = end.position.col - start.position.col;

    return {
      row: rowDiff !== 0 ? rowDiff / Math.abs(rowDiff) : 0,
      col: colDiff !== 0 ? colDiff / Math.abs(colDiff) : 0,
    };
  }

  private isInDirection(
    from: WordCell,
    to: WordCell,
    direction: { row: number; col: number }
  ): boolean {
    return (
      to.position.row === from.position.row + direction.row &&
      to.position.col === from.position.col + direction.col
    );
  }

  private isValidDirection(direction: { row: number; col: number }): boolean {
    // Todas las direcciones son válidas (horizontal, vertical y diagonal)
    return Math.abs(direction.row) <= 1 && Math.abs(direction.col) <= 1;
  }

  onCellMouseUp() {
    this.isSelecting = false;

    if (this.selection.length < 2) {
      this.selection = [];
      return;
    }

    const selectedWord = this.selection.map((cell) => cell.letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const foundWord = this.words.find(
      (word) =>
        !word.found &&
        (word.text === selectedWord || word.text === reversedWord)
    );

    if (foundWord) {
      foundWord.found = true;
      this.wordsFound++;

      for (const cell of this.selection) {
        cell.isFound = true;
      }

      foundWord.positions = this.selection.map((cell) => ({
        row: cell.position.row,
        col: cell.position.col,
      }));
    } else {
      for (const cell of this.selection) {
        if (!this.cellBelongsToFoundWord(cell)) {
          cell.isFound = false;
        }
      }
    }

    this.selection = [];

    if (this.wordsFound === this.totalWords) {
      clearInterval(this.timer);
      this.showWinAlert(); 
    }
  }

  onCellMouseLeave() {
    if (!this.isSelecting) {
      this.selection = [];
    }
  }


  isAligned(
    firstCell: WordCell,
    currentCell: WordCell,
    length: number
  ): boolean {
    for (const direction of this.directions) {
      const expectedRow = firstCell.position.row + (length - 1) * direction.row;
      const expectedCol = firstCell.position.col + (length - 1) * direction.col;

      if (
        expectedRow === currentCell.position.row &&
        expectedCol === currentCell.position.col
      ) {
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
    this.selection = [];
    this.isSelecting = false;
    this.words.forEach((word) => (word.found = false));

    this.timeLeft = this.originalTimeLimit;

    this.initializeGrid();
    this.placeWordsOnGrid();
    this.fillRemainingCells();

    if (this.timer) {
      clearInterval(this.timer);
    }
    this.startTimer();
  }

  toggleCompact(): void {
    this.isCompact = !this.isCompact;
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

  toggleHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
