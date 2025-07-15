import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfigurationService } from '../../../../core/infrastructure/api/game-configuration.service';
import {
  GameConfiguration,
  SolveTheWordWord,
  GameSetting,
} from '../../../../core/domain/model/game-configuration.model';
import { BaseAuthenticatedComponent } from '../../../../core/presentation/shared/base-authenticated.component';
import {
  GameAlertService,
  GameAlertConfig,
} from '../../../../core/infrastructure/service/game-alert.service';
import { RatingModalService } from '../../../../core/infrastructure/service/rating-modal.service';
import { GameAudioService } from '../../../../core/infrastructure/service/game-audio.service';
import { GameUrlService } from '../../../../core/infrastructure/service/game-url.service';
import { GameLoadingService } from '../../../../core/infrastructure/service/game-loading.service';
import { FloatingLogoComponent } from '../../../components/floating-logo/floating-logo.component';
import { GameHeaderComponent } from '../../../components/game-header/game-header.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { WordSidebarComponent } from './components/word-sidebar/word-sidebar.component';
import { GameLoadingStatesComponent } from './components/game-loading-states/game-loading-states.component';

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
  imports: [
    CommonModule,
    FloatingLogoComponent,
    GameHeaderComponent,
    GameBoardComponent,
    WordSidebarComponent,
    GameLoadingStatesComponent,
  ],
  templateUrl: './game-solve-the-word.component.html',
  styleUrl: './game-solve-the-word.component.css',
})
export class GameSolveTheWordComponent
  extends BaseAuthenticatedComponent
  implements OnInit, OnDestroy
{
  @Input() withProgrammings: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameConfigService = inject(GameConfigurationService);
  private gameAlertService = inject(GameAlertService);
  private ratingModalService = inject(RatingModalService);
  private gameAudioService = inject(GameAudioService);
  private gameUrlService = inject(GameUrlService);
  private gameLoadingService = inject(GameLoadingService);

  grid: WordCell[][] = [];
  words: Word[] = [];
  gridRows = 12;
  gridCols = 12;
  wordsFound = 0;
  totalWords = 0;
  timeLeft = 347; // default
  originalTimeLimit = 347; // Para calcular el tiempo usado
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
  userAssessed = false; // Nueva propiedad para controlar valoración
  gameConfig: GameConfiguration | null = null; // Configuración completa del juego
  mobileMenuOpen = false;
  // Header control
  headerExpanded = false;

  // Pista control
  mostrarPista = false;

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
    // Mostrar loading rápido para la carga del juego
    this.gameLoadingService.showFastGameLoading('Cargando Pupiletras...');

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
            console.error('❌ [SolveTheWord] Token inválido o expirado');
            this.error = 'El enlace del juego ha expirado o no es válido';
            this.loading = false;
            this.gameLoadingService.hideFast();
          }
        },
        error: (error) => {
          console.error('❌ [SolveTheWord] Error validando token:', error);
          this.error = 'Error al validar el acceso al juego';
          this.loading = false;
          this.gameLoadingService.hideFast();
        },
      });
    } else if (id) {
      // Si tenemos un ID tradicional, usarlo directamente
      const gameId = Number(id);
      if (gameId && !isNaN(gameId)) {
        this.cargarConfiguracionJuego(gameId);
      } else {
        console.error('❌ [SolveTheWord] ID de juego inválido:', id);
        this.error = 'ID de juego inválido';
        this.loading = false;
        this.gameLoadingService.hideFast();
      }
    } else {
      console.error('❌ [SolveTheWord] No se encontró ID ni token en la URL');
      this.error = 'No se proporcionó un ID de juego válido';
      this.loading = false;
      this.gameLoadingService.hideFast();
    }
  }

  private cargarConfiguracionJuego(id: number): void {
    this.loading = true;
    this.error = '';

    // Get userId from authenticated user
    const userId = this.currentUserId;

    this.gameConfigService
      .getGameConfiguration(id, userId || undefined, false)
      .subscribe({
        next: (response: {
          success: boolean;
          data: GameConfiguration;
          message?: string;
        }) => {
          if (response.success && response.data) {
            this.aplicarConfiguracion(response.data);
            this.iniciarJuego();
            this.gameLoadingService.hideFast();
          } else {
            this.error =
              response.message ||
              'No se pudo cargar la configuración del juego';
            this.gameLoadingService.hideFast();
          }
          this.loading = false;
        },
        error: (err: unknown) => {
          console.error('Error cargando configuración:', err);
          this.error = 'Error al cargar la configuración del juego';
          this.loading = false;
          this.gameLoadingService.hideFast();
        },
      });
  }

  private aplicarConfiguracion(data: GameConfiguration): void {
    // Guardar la configuración completa
    this.gameConfig = data;

    this.title = data.game_name;
    this.description = data.game_description;

    // Guardar el estado de evaluación del usuario
    this.userAssessed = data.assessed || false;

    // Aplicar configuraciones desde settings (con validación)
    if (data.settings && Array.isArray(data.settings)) {
      const getSetting = (key: string) =>
        data.settings.find((s: GameSetting) => s.key.toLowerCase() === key)
          ?.value;
      this.timeLeft = parseInt(getSetting('time_limit') || '347', 10);
      this.originalTimeLimit = this.timeLeft; // Guardar el tiempo original
      this.fontFamily = getSetting('font_family') || 'Arial';
      this.backgroundColor = getSetting('background_color') || '#fff';
      this.fontColor = getSetting('font_color') || '#000';
    } else {
      // Si no hay settings, usar valores por defecto
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
    const maxWordLen = this.words.reduce(
      (max, w) => Math.max(max, w.text.length),
      0
    );
    this.gridRows = Math.max(12, maxWordLen + 2, this.words.length + 2);
    this.gridCols = Math.max(12, maxWordLen + 2, this.words.length + 2);
  }

  private iniciarJuego(): void {
    this.gameAudioService.playGameStart();
    this.updateGridSize();
    this.initializeGrid();
    this.placeWordsOnGrid();
    this.fillRemainingCells();
    this.startTimer();
  }

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

  private async showWinAlert() {
    this.gameAudioService.playWordSearchAllWordsFound();

    const timeUsed = this.formatTime(this.originalTimeLimit - this.timeLeft);
    const config: GameAlertConfig = {
      gameType: 'solve-the-word',
      gameName: 'Pupiletras',
      timeUsed,
      wordsCompleted: this.wordsFound,
      totalWords: this.totalWords,
      userAssessed: this.userAssessed || (this.gameConfig?.assessed ?? false),
    };
    
    let shouldShowAlert = true;
    
    while (shouldShowAlert) {
      const result = await this.gameAlertService.showSuccessAlert(config);
      
      if (result.isConfirmed) {
        // Jugar de nuevo
        this.resetGame();
        shouldShowAlert = false;
      } else if (result.isDenied) {
        // Valorar juego
        await this.showRatingAlert('completed');
        // Actualizar la configuración para que no se muestre nuevamente el botón
        config.userAssessed = true;
        // Continuar el bucle para mostrar el modal nuevamente
      } else {
        // Ir al Dashboard (isDismissed o cualquier otro caso)
        this.volverAlDashboard();
        shouldShowAlert = false;
      }
    }
  }

  private async showRatingAlert(context: 'completed' | 'timeup' | 'general' = 'general'): Promise<void> {
    if (!this.gameConfig || !this.currentUserId) return;

    try {
      const gameInstanceId = this.gameConfig.game_instance_id;
      const gameName = this.gameConfig.game_name || 'Pupiletras';

      const result = await this.ratingModalService.showRatingModal(
        gameInstanceId,
        this.currentUserId,
        gameName,
        context
      );

      if (result) {
        this.userAssessed = true;
        // Actualizar también la configuración del juego para evitar mostrar nuevamente
        if (this.gameConfig) {
          this.gameConfig.assessed = true;
        }
      }
    } catch (error) {
      console.error('Error al mostrar modal de valoración:', error);
    }
  }

  private async showTimeUpAlert() {
    this.gameAudioService.playTimeUp();

    const config: GameAlertConfig = {
      gameType: 'solve-the-word',
      gameName: 'Pupiletras',
      wordsCompleted: this.wordsFound,
      totalWords: this.totalWords,
      userAssessed: this.userAssessed || (this.gameConfig?.assessed ?? false),
    };

    let shouldShowAlert = true;
    
    while (shouldShowAlert) {
      const result = await this.gameAlertService.showTimeUpAlert(config);
      
      if (result.isConfirmed) {
        // Intentar de nuevo
        this.resetGame();
        shouldShowAlert = false;
      } else if (result.isDenied) {
        // Valorar juego
        await this.showRatingAlert('timeup');
        // Actualizar la configuración para que no se muestre nuevamente el botón
        config.userAssessed = true;
        // Continuar el bucle para mostrar el modal nuevamente
      } else {
        // Ir al Dashboard (isDismissed o cualquier otro caso)
        this.volverAlDashboard();
        shouldShowAlert = false;
      }
    }
  }

  placeWordsOnGrid() {
    for (const word of this.words) {
      let placed = false;
      let attempts = 0;

      // ✅ MAPEO CORREGIDO DE ORIENTACIONES
      const orientationMap: { [key: string]: { row: number; col: number } } = {
        HL: { row: 0, col: 1 }, // Horizontal Left to Right (→)
        HR: { row: 0, col: -1 }, // Horizontal Right to Left (←)
        VU: { row: -1, col: 0 }, // Vertical Up (↑)
        VD: { row: 1, col: 0 }, // Vertical Down (↓)
        DU: { row: -1, col: 1 }, // Diagonal Up-Right (↗)
        DD: { row: 1, col: 1 }, // Diagonal Down-Right (↘)
      };

      const direction = orientationMap[word.orientation || 'HL'] || {
        row: 0,
        col: 1,
      };

      while (!placed && attempts < 100) {
        attempts++;

        // ✅ CÁLCULO CORREGIDO DE POSICIONES INICIALES
        let maxStartRow: number;
        let maxStartCol: number;

        if (direction.row === 0) {
          // Horizontal: la fila puede ser cualquiera
          maxStartRow = this.gridRows - 1;
        } else if (direction.row > 0) {
          // Hacia abajo: debe tener espacio suficiente hacia abajo
          maxStartRow = this.gridRows - word.text.length;
        } else {
          // Hacia arriba: debe empezar desde una posición que permita ir hacia arriba
          maxStartRow = word.text.length - 1;
        }

        if (direction.col === 0) {
          // Vertical: la columna puede ser cualquiera
          maxStartCol = this.gridCols - 1;
        } else if (direction.col > 0) {
          // Hacia derecha: debe tener espacio suficiente hacia derecha
          maxStartCol = this.gridCols - word.text.length;
        } else {
          // Hacia izquierda: debe empezar desde una posición que permita ir hacia izquierda
          maxStartCol = word.text.length - 1;
        }

        // ✅ GENERAR POSICIONES VÁLIDAS
        const minStartRow = direction.row < 0 ? word.text.length - 1 : 0;
        const minStartCol = direction.col < 0 ? word.text.length - 1 : 0;

        const startRow =
          Math.floor(Math.random() * (maxStartRow - minStartRow + 1)) +
          minStartRow;
        const startCol =
          Math.floor(Math.random() * (maxStartCol - minStartCol + 1)) +
          minStartCol;

        if (this.canPlaceWord(word.text, startRow, startCol, direction)) {
          const positions = [];

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

      if (!placed) {
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
    console.log(`⚠️ Colocando palabra fallback: ${word.text}`);

    // ✅ INTENTAR COLOCAR CON LA ORIENTACIÓN ORIGINAL PRIMERO
    const orientationMap: { [key: string]: { row: number; col: number } } = {
      HL: { row: 0, col: 1 }, // Horizontal Left to Right (→)
      HR: { row: 0, col: -1 }, // Horizontal Right to Left (←)
      VU: { row: -1, col: 0 }, // Vertical Up (↑)
      VD: { row: 1, col: 0 }, // Vertical Down (↓)
      DU: { row: -1, col: 1 }, // Diagonal Up-Right (↗)
      DD: { row: 1, col: 1 }, // Diagonal Down-Right (↘)
    };

    const preferredDirection = orientationMap[word.orientation || 'HL'] || {
      row: 0,
      col: 1,
    };

    // ✅ INTENTAR CON LA ORIENTACIÓN PREFERIDA
    if (this.tryPlaceWordWithDirection(word, preferredDirection)) {
      return;
    }

    // ✅ SI NO FUNCIONA, INTENTAR CON TODAS LAS ORIENTACIONES
    const allDirections = Object.values(orientationMap);

    for (const direction of allDirections) {
      if (this.tryPlaceWordWithDirection(word, direction)) {
        return;
      }
    }

    // ✅ ÚLTIMO RECURSO: COLOCAR HORIZONTALMENTE EN LA PRIMERA POSICIÓN DISPONIBLE
    this.forceHorizontalPlacement(word);
  }

  private forceHorizontalPlacement(word: Word): void {
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
          return;
        }
      }
    }
  }

  private getValidStartCols(
    wordLength: number,
    direction: { row: number; col: number }
  ): number[] {
    const cols = [];

    if (direction.col === 0) {
      // Vertical: cualquier columna
      for (let i = 0; i < this.gridCols; i++) {
        cols.push(i);
      }
    } else if (direction.col > 0) {
      // Hacia derecha: desde 0 hasta (gridCols - wordLength)
      for (let i = 0; i <= this.gridCols - wordLength; i++) {
        cols.push(i);
      }
    } else {
      // Hacia izquierda: desde (wordLength - 1) hasta (gridCols - 1)
      for (let i = wordLength - 1; i < this.gridCols; i++) {
        cols.push(i);
      }
    }

    return cols;
  }

  private getValidStartRows(
    wordLength: number,
    direction: { row: number; col: number }
  ): number[] {
    const rows = [];

    if (direction.row === 0) {
      // Horizontal: cualquier fila
      for (let i = 0; i < this.gridRows; i++) {
        rows.push(i);
      }
    } else if (direction.row > 0) {
      // Hacia abajo: desde 0 hasta (gridRows - wordLength)
      for (let i = 0; i <= this.gridRows - wordLength; i++) {
        rows.push(i);
      }
    } else {
      // Hacia arriba: desde (wordLength - 1) hasta (gridRows - 1)
      for (let i = wordLength - 1; i < this.gridRows; i++) {
        rows.push(i);
      }
    }

    return rows;
  }

  private tryPlaceWordWithDirection(
    word: Word,
    direction: { row: number; col: number }
  ): boolean {
    const startRows = this.getValidStartRows(word.text.length, direction);
    const startCols = this.getValidStartCols(word.text.length, direction);

    for (const startRow of startRows) {
      for (const startCol of startCols) {
        if (this.canPlaceWord(word.text, startRow, startCol, direction)) {
          const positions = [];
          for (let i = 0; i < word.text.length; i++) {
            const row = startRow + i * direction.row;
            const col = startCol + i * direction.col;
            this.grid[row][col].letter = word.text[i];
            positions.push({ row, col });
          }
          word.positions = positions;
          return true;
        }
      }
    }
    return false;
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

        // Reproducir sonido de advertencia cuando quedan 30 segundos
        if (this.timeLeft === 30) {
          this.gameAudioService.playTimeWarning();
        }

        // Reproducir countdown en los últimos 5 segundos
        if (this.timeLeft <= 5 && this.timeLeft > 0) {
          this.gameAudioService.playCountdown();
        }
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
    if (this.loading) return;
    this.gameAudioService.playWordSearchLetterSelect();
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
      this.gameAudioService.playWordSearchWordFound();
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
      this.gameAudioService.playWordSearchWordNotFound();
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

  // Métodos para el header
  toggleHeader(): void {
    this.headerExpanded = !this.headerExpanded;
  }

  get tituloJuego(): string {
    return this.title || 'Pupiletras';
  }

  get descripcionJuego(): string {
    return (
      this.description ||
      'Encuentra todas las palabras ocultas en la sopa de letras'
    );
  }

  get porcentajeProgreso(): number {
    return this.totalWords > 0
      ? Math.round((this.wordsFound / this.totalWords) * 100)
      : 0;
  }

  volverAlDashboard(): void {
    // Oculta cualquier modal visual si los tienes definidos
    if ((this as any).mostrarModalTiempoAgotado !== undefined) (this as any).mostrarModalTiempoAgotado = false;
    if ((this as any).mostrarModalJuegoFinalizado !== undefined) (this as any).mostrarModalJuegoFinalizado = false;
    if ((this as any).mostrarModalFallo !== undefined) (this as any).mostrarModalFallo = false;
    if ((this as any).mostrarModalExito !== undefined) (this as any).mostrarModalExito = false;
    // Limpia el returnUrl si tienes RedirectService
    try {
      const redirectService = (this as any).redirectService;
      if (redirectService && typeof redirectService.clearReturnUrl === 'function') {
        redirectService.clearReturnUrl();
      }
    } catch {}
    this.router.navigate(['/inicio'], { replaceUrl: true });
  }

  formatearTiempo(): string {
    return this.formatTime(this.timeLeft);
  }

  togglePista(): void {
    this.mostrarPista = !this.mostrarPista;
  }

  get pistaTexto(): string {
    return (
      this.description ||
      'Busca las palabras en todas las direcciones: horizontal, vertical y diagonal. Las palabras pueden estar escritas hacia adelante o hacia atrás.'
    );
  }
}
