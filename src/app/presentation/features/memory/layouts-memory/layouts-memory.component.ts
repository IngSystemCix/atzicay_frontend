import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './layouts-memory.component.html',
  styleUrl: './layouts-memory.component.css'
})
export class LayoutsMemoryComponent {
  // Tab management
  activeTab: TabType = 'contenido';

  // Game configuration
  gameTitle: string = '';
  gameDescription: string = '';
  cardType: CardType = 'imagen-texto';

  // Game settings
  gameSettings = {
    difficulty: 'medio',
    timeLimit: false,
    timeLimitMinutes: 5,
    soundEffects: true,
    animations: true,
    showHints: false
  };

  // Card pairs
  pairs: CardPair[] = [
    {
      id: 1,
      card1: { image: null, text: '', imageUrl: '' },
      card2: { image: null, text: '', imageUrl: '' }
    }
  ];

  // Statistics
  get totalPairs(): number {
    return this.pairs.length;
  }

  get completedPairs(): number {
    return this.pairs.filter(pair =>
      this.isCardComplete(pair.card1) && this.isCardComplete(pair.card2)
    ).length;
  }

  get gameProgress(): number {
    if (this.totalPairs === 0) return 0;
    return Math.round((this.completedPairs / this.totalPairs) * 100);
  }

  constructor() {
    this.initializeDefaultData();
  }

  // Tab management methods
  setActiveTab(tab: TabType): void {
    if (this.isValidTab(tab)) {
      this.activeTab = tab;
      this.logTabChange(tab);
    }
  }

  private isValidTab(tab: string): tab is TabType {
    return ['contenido', 'configuracion', 'vista-previa'].includes(tab);
  }

  private logTabChange(tab: TabType): void {
    console.log(`Tab changed to: ${tab}`);
  }

  // Card pair management methods
  addPair(): void {
    const newPair: CardPair = {
      id: this.generateNewId(),
      card1: { image: null, text: '', imageUrl: '' },
      card2: { image: null, text: '', imageUrl: '' }
    };

    this.pairs.push(newPair);
    this.logAction('Pair added', newPair);
  }

  removePair(index: number): void {
    if (this.canRemovePair(index)) {
      const removedPair = this.pairs.splice(index, 1)[0];
      this.logAction('Pair removed', removedPair);
    } else {
      console.warn('Cannot remove pair: Invalid index or minimum pairs requirement not met');
    }
  }

  private canRemovePair(index: number): boolean {
    return this.pairs.length > 1 &&
      index >= 0 &&
      index < this.pairs.length;
  }

  private generateNewId(): number {
    return Math.max(...this.pairs.map(p => p.id), 0) + 1;
  }

  // Card content validation
  private isCardComplete(card: CardPair['card1']): boolean {
    if (!card) return false;

    switch (this.cardType) {
      case 'imagen-texto':
        return !!(card.image || card.imageUrl) && !!card.text?.trim();
      case 'imagenes':
        return !!(card.image || card.imageUrl);
      default:
        return false;
    }
  }

  // File handling methods
  onFileSelected(event: Event, pairIndex: number, cardNumber: 1 | 2): void {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files?.[0] || null;

    if (file && this.isValidImageFile(file)) {
      const cardKey = cardNumber === 1 ? 'card1' : 'card2';
      if (this.pairs[pairIndex][cardKey]) {
        this.pairs[pairIndex][cardKey]!.image = file;
        this.pairs[pairIndex][cardKey]!.imageUrl = URL.createObjectURL(file);
        this.logAction(`File selected for pair ${pairIndex + 1}, card ${cardNumber}`, file);
      }
    } else {
      this.showFileError(file);
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

  // Form validation
  isFormValid(): boolean {
    return this.isBasicInfoValid() && this.arePairsValid();
  }

  private isBasicInfoValid(): boolean {
    return !!(this.gameTitle.trim() && this.gameDescription.trim());
  }

  private arePairsValid(): boolean {
    return this.pairs.length >= 3 &&
      this.pairs.every(pair => this.isCardComplete(pair.card1) && this.isCardComplete(pair.card2));
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

    const incompletePairs = this.pairs.filter(pair =>
      !this.isCardComplete(pair.card1) || !this.isCardComplete(pair.card2)
    ).length;

    if (incompletePairs > 0) {
      errors.push(`${incompletePairs} pares están incompletos`);
    }

    return errors;
  }

  // Action methods
  onSave(): void {
    if (this.isFormValid()) {
      const gameData = this.prepareGameData();
      this.logAction('Game saved', gameData);
      console.log('Guardando juego...', gameData);
      // Here you would typically call a service to save the data
    } else {
      const errors = this.getValidationErrors();
      console.error('Cannot save game:', errors);
      // Here you could show validation errors to the user
    }
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmCancel = confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados.');
      if (!confirmCancel) return;
    }

    this.resetForm();
    this.logAction('Game creation cancelled');
    console.log('Cancelando...');
  }

  // Utility methods
  private initializeDefaultData(): void {
    // You could load default data or user preferences here
    console.log('Component initialized');
  }

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
        card2: { image: null, text: '', imageUrl: '' }
      }
    ];
  }

  private prepareGameData() {
    return {
      title: this.gameTitle,
      description: this.gameDescription,
      cardType: this.cardType,
      settings: this.gameSettings,
      pairs: this.pairs.map(pair => ({
        id: pair.id,
        card1: {
          text: pair.card1?.text || '',
          hasImage: !!(pair.card1?.image || pair.card1?.imageUrl)
        },
        card2: {
          text: pair.card2?.text || '',
          hasImage: !!(pair.card2?.image || pair.card2?.imageUrl)
        }
      })),
      stats: {
        totalPairs: this.totalPairs,
        completedPairs: this.completedPairs,
        progress: this.gameProgress
      },
      createdAt: new Date().toISOString()
    };
  }

  private logAction(action: string, data?: any): void {
    console.log(`[MemoryGame] ${action}`, data || '');
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
      card2: pair.card2
    }));
  }

  // Settings management
  updateGameSettings(setting: keyof typeof this.gameSettings, value: any): void {
    this.gameSettings = { ...this.gameSettings, [setting]: value };
    this.logAction(`Setting updated: ${setting}`, value);
  }

  
}
