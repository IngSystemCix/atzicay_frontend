import { Component, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { AlertService } from '../../../../core/infrastructure/service/alert.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import {
  AtzicayTabsComponent,
  Tab,
} from '../../../components/atzicay-tabs/atzicay-tabs.component';
import { Platform } from '@angular/cdk/platform';
import { GenericConfigGameComponent } from '../../../components/generic-config-game/generic-config-game.component';

interface CardPair {
  id: number;
  card1: {
    image?: File | null;
    text?: string;
    imageUrl?: string;
  } | null;
  card2: {
    image?: File | null;
    text?: string;
    imageUrl?: string;
  } | null;
}

type TabType = 'contenido' | 'configuracion' | 'vista-previa';
type CardType = 'imagen-texto' | 'imagenes';


@Component({
  selector: 'app-layouts-memory',
  imports: [CommonModule, FormsModule, AtzicayTabsComponent, GenericConfigGameComponent],
  templateUrl: './layouts-memory.component.html',
  styleUrl: './layouts-memory.component.css',
  providers: [CreateGameService],
})
export class LayoutsMemoryComponent implements OnDestroy {
  // Tab management
  activeTab: TabType = 'contenido';
  isMobile = false;
  // Tabs configuration for the generic component
  tabs: Tab<TabType>[] = [
    { id: 'contenido', label: 'Contenido' },
    { id: 'configuracion', label: 'Configuración' },
    { id: 'vista-previa', label: 'Vista Previa' },
  ];

  // Game configuration
  gameTitle: string = '';
  gameDescription: string = '';
  private _cardType: CardType = 'imagen-texto';
  set cardType(value: CardType) {
    this._cardType = value;
  }
  get cardType(): CardType {
    return this._cardType;
  }

  // Game settings
  gameSettings = {
    difficulty: 'E', // 'E' = Fácil, 'M' = Medio, 'H' = Difícil
    font: 'Arial',
    fontColor: '#000000',
    backgroundColor: '#ffffff',
    successMessage: '¡Excelente trabajo!',
    failureMessage: '¡Inténtalo de nuevo!',
    visibility: 'P', // P = Público, R = Restringido
    time_limit: 60 // Valor por defecto
  };

  // Tiempo límite para el juego (vinculado al input)
  get timeLimit(): number {
    return this.gameSettings.time_limit;
  }
  set timeLimit(value: number) {
    // Limitar entre 10 y 300 segundos
    this.gameSettings.time_limit = Math.max(10, Math.min(300, value));
  }

  // Card pairs
  pairs: CardPair[] = [
    {
      id: 1,
      card1: { image: null, text: '', imageUrl: '' },
      card2: { image: null, text: '', imageUrl: '' },
    },
  ];

  get totalPairs(): number {
    return this.pairs.length;
  }

  get completedPairs(): number {
    return this.pairs.filter((pair) => this.isPairComplete(pair)).length;
  }

  get gameProgress(): number {
    if (this.totalPairs === 0) return 0;
    return Math.round((this.completedPairs / this.totalPairs) * 100);
  }

  isSaving = false;

  constructor(
    public createGameService: CreateGameService,
    private alertService: AlertService,
    private userSessionService: UserSessionService,
    private router: Router,
    private platform: Platform,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.initializeDefaultData();
    this.checkViewport();
    // Listen for window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkViewport());
    }
  }

  // Tab management methods
  setActiveTab(tab: TabType): void {
    if (this.isValidTab(tab)) {
      this.activeTab = tab;
    }
  }

  onTabChanged(tabId: TabType): void {
    this.setActiveTab(tabId);
  }

  private isValidTab(tab: string): tab is TabType {
    return ['contenido', 'configuracion', 'vista-previa'].includes(tab);
  }

  // Card pair management methods
  addPair(): void {
    // Validar que el primer par (el más reciente) esté completo antes de agregar uno nuevo
    if (this.pairs.length > 0 && !this.isPairComplete(this.pairs[0])) {
      this.alertService.showWarning('Completa el par actual antes de agregar uno nuevo.');
      return;
    }
    const newPair: CardPair = {
      id: this.generateNewId(),
      card1: { image: null, text: '', imageUrl: '' },
      card2: { image: null, text: '', imageUrl: '' },
    };
    this.pairs.unshift(newPair); // Agregar al inicio
    this.logAction('Pair added', newPair);
    setTimeout(() => {
      const pairElements = this.el.nativeElement.querySelectorAll('.pair-item');
      if (pairElements && pairElements.length > 0) {
        const firstPair = pairElements[0];
        if (firstPair) {
          firstPair.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  }

  removePair(index: number): void {
    if (this.canRemovePair(index)) {
      const removedPair = this.pairs.splice(index, 1)[0];
      this.logAction('Pair removed', removedPair);
    } else {
      console.warn(
        'Cannot remove pair: Invalid index or minimum pairs requirement not met'
      );
    }
  }

  private canRemovePair(index: number): boolean {
    return this.pairs.length > 1 && index >= 0 && index < this.pairs.length;
  }

  private generateNewId(): number {
    return Math.max(...this.pairs.map((p) => p.id), 0) + 1;
  }

  // Card content validation
  private isCardComplete(card: CardPair['card1']): boolean {
    if (!card) return false;

    switch (this.cardType) {
      case 'imagen-texto':
        // Para imagen-texto, necesita imagen Y texto
        return !!(card.image || card.imageUrl) && !!card.text?.trim();
      case 'imagenes':
        // Para solo imágenes, solo necesita imagen
        return !!(card.image || card.imageUrl);
      default:
        return false;
    }
  }

  // Método específico para validar pares según el modo
  private isPairComplete(pair: CardPair): boolean {
    if (!pair.card1) return false;
    if (this.cardType === 'imagen-texto') {
      // En modo imagen-texto, solo necesitamos validar card1 (imagen + texto)
      return this.isCardComplete(pair.card1);
    } else if (this.cardType === 'imagenes') {
      // En modo imagen-imagen, necesitamos ambas cards con imágenes
      return (
        !!(pair.card1?.image || pair.card1?.imageUrl) &&
        !!(pair.card2?.image || pair.card2?.imageUrl)
      );
    }
    return false;
  }

  // File handling methods
  onFileSelected(event: Event, pairIndex: number, cardNumber: 1 | 2): void {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files?.[0] || null;

    if (!file) {
      return;
    }

    const validation = this.validateImageFile(file);

    if (!validation.isValid) {
      this.alertService.showError(validation.error || 'Archivo no válido');
      // Limpiar el input
      input.value = '';
      return;
    }

    const cardKey = cardNumber === 1 ? 'card1' : 'card2';
    const pair = this.pairs[pairIndex];

    if (pair[cardKey]) {
      // Liberar URL anterior si existe
      if (
        pair[cardKey]!.imageUrl &&
        pair[cardKey]!.imageUrl!.startsWith('blob:')
      ) {
        URL.revokeObjectURL(pair[cardKey]!.imageUrl!);
      }

      // Asignar nueva imagen
      pair[cardKey]!.image = file;
      pair[cardKey]!.imageUrl = URL.createObjectURL(file);

      this.logAction(
        `File selected for pair ${pairIndex + 1}, card ${cardNumber}`,
        {
          name: file.name,
          size: file.size,
          type: file.type,
        }
      );
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 1024 * 1024; // 1MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  private showFileError(file: File | null): void {
    if (!file) {
      console.error('No file selected');
      return;
    }

    if (!this.isValidImageFile(file)) {
      console.error('Invalid file: Must be an image under 1MB');
      // Here you could show a toast notification or modal
    }
  }
  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', () => this.checkViewport());
    }
    // Liberar todas las URLs de objetos creadas
    this.pairs.forEach((pair) => {
      if (pair.card1?.imageUrl && pair.card1.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pair.card1.imageUrl);
      }
      if (pair.card2?.imageUrl && pair.card2.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pair.card2.imageUrl);
      }
    });
  }

  private checkViewport() {
    this.isMobile = window.innerWidth < 768;
  }
  getPreviewPairs() {
  // Show fewer pairs on mobile
  return this.pairs.slice(0, this.isMobile ? 4 : 6);
}
  // Form validation
  isFormValid(): boolean {
    return this.isBasicInfoValid() && this.arePairsValid();
  }

  private isBasicInfoValid(): boolean {
    return !!(this.gameTitle.trim() && this.gameDescription.trim());
  }

  private arePairsValid(): boolean {
    return (
      this.pairs.length >= 3 &&
      this.pairs.every((pair) => this.isPairComplete(pair))
    );
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.gameTitle.trim()) {
      errors.push('El título del juego es requerido');
    }

    if (!this.gameDescription.trim()) {
      errors.push('La descripción del juego es requerida');
    }

    if (this.pairs.length < 3) {
      errors.push('Se requieren al menos 3 pares de tarjetas');
    }

    const incompletePairs = this.pairs.filter(
      (pair) => !this.isPairComplete(pair)
    ).length;

    if (incompletePairs > 0) {
      errors.push(`${incompletePairs} pares están incompletos`);
    }

    return errors;
  }

  // Action methods
  async onCancel(): Promise<void> {
    const shouldCancel = await this.alertService.showCancelGameCreation('Memoria');
    if (shouldCancel) {
      this.alertService.showCancellationSuccess('Memoria');
      this.router.navigate(['/juegos']);
    }
  }

  async onSave(): Promise<void> {
    // Llamar al debug method antes de validar
    await this.debugPayload();

    if (!this.isFormValid()) {
      const errors = this.getValidationErrors();
      console.error('Cannot save game:', errors);
      this.alertService.showError(errors.join(', '));
      return;
    }
    this.isSaving = true;
    try {
      const userId = this.userSessionService.getUserId();

      if (!userId) {
        this.alertService.showError(
          'No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.'
        );
        this.isSaving = false;
        return;
      }

      // CORRECTO: Usar buildPairsPayload para enviar imágenes y textos
      const pairsPayload = await this.buildPairsPayload();
      const settingsPayload = this.buildSettingsPayload();

      // Formato exacto requerido por el backend
      const gameData = {
        Name: this.gameTitle,
        Description: this.gameDescription,
        Activated: true,
        Difficulty: this.gameSettings.difficulty, // En nivel superior
        Visibility: this.gameSettings.visibility, // En nivel superior
        Mode: this.cardType === 'imagenes' ? 'II' : 'ID',
        Pairs: pairsPayload,
        Settings: settingsPayload,
      };

      const body = {
        gameType: 'memory',
        data: gameData,
      };

      this.createGameService.createMemoryGame(userId, body).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.logAction('Game saved', res);
          this.alertService.showGameCreatedSuccess('Juego de memoria');
          this.resetForm();
          // Redirigir a la vista de juegos después de crear exitosamente
          this.router.navigate(['/juegos']);
        },
        error: (err: any) => {
          this.isSaving = false;
          this.alertService.showGameCreationError(err, 'juego de memoria');
        },
      });
    } catch (e) {
      this.isSaving = false;
      this.alertService.showError('Error procesando imágenes');
      console.error(e);
    }
  }

  private async buildPairsPayload(): Promise<any[]> {
    const promises = this.pairs.map(async (pair) => {
      if (this.cardType === 'imagenes') {
        const PathImg1 = pair.card1?.image
          ? await this.fileToBase64(pair.card1.image)
          : pair.card1?.imageUrl || '';
        const PathImg2 = pair.card2?.image
          ? await this.fileToBase64(pair.card2.image)
          : pair.card2?.imageUrl || '';

        return {
          PathImg1,
          PathImg2,
        };
      } else {
        const PathImg1 = pair.card1?.image
          ? await this.fileToBase64(pair.card1.image)
          : pair.card1?.imageUrl || '';

        return {
          PathImg1,
          DescriptionImg: pair.card1?.text || '',
        };
      }
    });
    return Promise.all(promises);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          // Retorna la data URI completa, como en el puzzle
          resolve(reader.result as string);
        } else {
          reject('Error reading file');
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private buildSettingsPayload(): Array<{
    ConfigKey: string;
    ConfigValue: string;
  }> {
    // Convierte las configuraciones del juego al formato requerido por el backend
    const settings = [];

    if (this.gameSettings.time_limit){
      settings.push({
        ConfigKey: 'time_limit',
        ConfigValue: String(this.gameSettings.time_limit),
      });
    }

    // Font configuration
    if (this.gameSettings.font) {
      settings.push({
        ConfigKey: 'font',
        ConfigValue: this.gameSettings.font,
      });
    }

    // Font color configuration
    if (this.gameSettings.fontColor) {
      settings.push({
        ConfigKey: 'fontColor',
        ConfigValue: this.gameSettings.fontColor,
      });
    }

    // Background color configuration
    if (this.gameSettings.backgroundColor) {
      settings.push({
        ConfigKey: 'backgroundColor',
        ConfigValue: this.gameSettings.backgroundColor,
      });
    }

    // Success message configuration
    if (this.gameSettings.successMessage) {
      settings.push({
        ConfigKey: 'successMessage',
        ConfigValue: this.gameSettings.successMessage,
      });
    }

    // Failure message configuration
    if (this.gameSettings.failureMessage) {
      settings.push({
        ConfigKey: 'failureMessage',
        ConfigValue: this.gameSettings.failureMessage,
      });
    }

    // NO incluir difficulty ni visibility aquí - van en el nivel superior del GameInstance

    return settings;
  }

  // Utility methods
  private initializeDefaultData(): void {}

  private hasUnsavedChanges(): boolean {
    return !!(this.gameTitle || this.gameDescription || this.pairs.length > 1);
  }

  private resetForm(): void {
    this.gameTitle = '';
    this.gameDescription = '';
    this.cardType = 'imagen-texto';
    this.activeTab = 'contenido';
    this.pairs = [
      {
        id: 1,
        card1: { image: null, text: '', imageUrl: '' },
        card2: { image: null, text: '', imageUrl: '' },
      },
    ];
  }

  removeImage(pairIndex: number, cardNumber: 1 | 2): void {
    if (pairIndex >= 0 && pairIndex < this.pairs.length) {
      const cardKey = cardNumber === 1 ? 'card1' : 'card2';
      const pair = this.pairs[pairIndex];

      if (pair[cardKey]) {
        // Liberar URL si existe
        if (
          pair[cardKey]!.imageUrl &&
          pair[cardKey]!.imageUrl!.startsWith('blob:')
        ) {
          URL.revokeObjectURL(pair[cardKey]!.imageUrl!);
        }

        // Limpiar la imagen
        pair[cardKey]!.image = null;
        pair[cardKey]!.imageUrl = '';

        this.logAction(
          `Image removed from pair ${pairIndex + 1}, card ${cardNumber}`
        );
      }
    }
  }

  hasImage(pair: CardPair, cardNumber: 1 | 2): boolean {
    const cardKey = cardNumber === 1 ? 'card1' : 'card2';
    const card = pair[cardKey];
    return !!(card?.image || card?.imageUrl);
  }

  getCardText(pair: CardPair, cardNumber: 1 | 2): string {
    const cardKey = cardNumber === 1 ? 'card1' : 'card2';
    return pair[cardKey]?.text || '';
  }

  updateCardText(pairIndex: number, cardNumber: 1 | 2, text: string): void {
    if (pairIndex >= 0 && pairIndex < this.pairs.length) {
      const cardKey = cardNumber === 1 ? 'card1' : 'card2';
      const pair = this.pairs[pairIndex];

      if (pair[cardKey]) {
        pair[cardKey]!.text = text;
        this.logAction(
          `Text updated for pair ${pairIndex + 1}, card ${cardNumber}`,
          text
        );
      }
    }
  }

  /**
   * Obtiene la configuración para el componente genérico
   */
  getConfigSettings() {
    return {
      font: this.gameSettings.font,
      fontColor: this.gameSettings.fontColor,
      backgroundColor: this.gameSettings.backgroundColor,
      successMessage: this.gameSettings.successMessage,
      failureMessage: this.gameSettings.failureMessage,
      difficulty: this.gameSettings.difficulty,
      visibility: this.gameSettings.visibility
    };
  }

  /**
   * Maneja los cambios del componente genérico de configuración
   */
  onConfigChange(settings: any) {
    // Actualizar gameSettings con los valores del componente genérico
    this.gameSettings = {
      ...this.gameSettings,
      font: settings.font,
      fontColor: settings.fontColor,
      backgroundColor: settings.backgroundColor,
      successMessage: settings.successMessage,
      failureMessage: settings.failureMessage,
      difficulty: settings.difficulty,
      visibility: settings.visibility,
      time_limit: settings.time_limit !== undefined ? settings.time_limit : this.gameSettings.time_limit
    };
  }

  // Settings management
  updateGameSettings(
    setting: keyof typeof this.gameSettings,
    value: any
  ): void {
    this.gameSettings = { ...this.gameSettings, [setting]: value };
    this.logAction(`Setting updated: ${setting}`, value);
  }

  // Preview methods
  generatePreview(): any[] {
    // Generate a preview of how the game will look
    return this.pairs.slice(0, 6).map((pair, index) => ({
      id: pair.id,
      position: index,
      isFlipped: false,
      isMatched: false,
      card1: pair.card1,
      card2: pair.card2,
    }));
  }

  // Debug method para ver exactamente qué se está enviando
  async debugPayload(): Promise<void> {
    // Verificar userId
    const userId = this.userSessionService.getUserId();

    if (!userId) {
      console.warn('⚠️ WARNING: Usuario no autenticado o userId no disponible');
      return;
    }

    // Validar cada par
    this.pairs.forEach((pair, index) => {
      console.log(`--- Par ${index + 1} ---`);
      console.log('card1:', {
        hasImage: !!(pair.card1?.image || pair.card1?.imageUrl),
        text: pair.card1?.text,
        imageSize: pair.card1?.image?.size,
        imageType: pair.card1?.image?.type,
      });

      if (this.cardType === 'imagenes') {
        console.log('card2:', {
          hasImage: !!(pair.card2?.image || pair.card2?.imageUrl),
          text: pair.card2?.text,
          imageSize: pair.card2?.image?.size,
          imageType: pair.card2?.image?.type,
        });
      }
    });

    try {
      const pairsPayload = await this.buildPairsPayload();
      const settingsPayload = await this.buildSettingsPayload();

      const gameData = {
        Name: this.gameTitle,
        Description: this.gameDescription,
        Activated: true,
        Mode: this.cardType === 'imagenes' ? 'II' : 'ID',
        Pairs: pairsPayload,
        Settings: settingsPayload,
      };

      const body = {
        gameType: 'memory',
        data: gameData,
      };
    } catch (error) {
      console.error('Error generating debug payload:', error);
    }
  }

  private validateImageFile(file: File): { isValid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 1024 * 1024; // 1MB
    const minSize = 1024; // 1KB mínimo

    if (!validTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: 'Formato no válido. Solo se permiten: PNG, JPG, JPEG',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo es muy grande. Máximo 1MB permitido',
      };
    }

    if (file.size < minSize) {
      return {
        isValid: false,
        error: 'El archivo es muy pequeño. Mínimo 1KB requerido',
      };
    }

    return { isValid: true };
  }
  private prepareGameData() {
    return {
      title: this.gameTitle,
      description: this.gameDescription,
      cardType: this.cardType,
      settings: this.gameSettings,
      pairs: this.pairs.map((pair) => ({
        id: pair.id,
        card1: {
          text: pair.card1?.text || '',
          hasImage: !!(pair.card1?.image || pair.card1?.imageUrl),
        },
        card2: {
          text: pair.card2?.text || '',
          hasImage: !!(pair.card2?.image || pair.card2?.imageUrl),
        },
      })),
      stats: {
        totalPairs: this.totalPairs,
        completedPairs: this.completedPairs,
        progress: this.gameProgress,
      },
      createdAt: new Date().toISOString(),
    };
  }

  private logAction(action: string, data?: any): void {}

  // Helper method para verificar autenticación
  private checkUserAuthentication(): {
    isAuthenticated: boolean;
    userId: number | null;
  } {
    const userId = this.userSessionService.getUserId();
    const isAuthenticated = this.userSessionService.isAuthenticated();

    return { isAuthenticated, userId };
  }

  // Devuelve la URL de la imagen con cache busting
  getCacheBustedImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    // Si ya tiene un parámetro v, lo reemplazamos
    const baseUrl = imageUrl.split('?v=')[0];
    return `${baseUrl}?v=${Date.now()}`;
  }
}
