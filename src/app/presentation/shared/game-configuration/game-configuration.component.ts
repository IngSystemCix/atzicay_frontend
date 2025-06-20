import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameConfiguration, GameConfigurationService } from '../../../core/infrastructure/api/GameSetting/game-configuration.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-configuration.component.html',
  styleUrl: './game-configuration.component.css'
})
export class GameConfigurationComponent implements OnInit, OnChanges {
  @Input() gameId: number | null = null; // Volver a number
  @Input() isVisible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<GameConfiguration>();

  gameConfig: GameConfiguration | null = null;
  isLoading = false;
  error: string | null = null;
  isSaving = false;

  // Opciones para los selects
  difficultyOptions = [
    { value: 'E', label: 'Básico' },
    { value: 'M', label: 'Intermedio' },
    { value: 'H', label: 'Difícil' }
  ];

  visibilityOptions = [
    { value: 'P', label: 'Público' },
    { value: 'R', label: 'Restringido' }
  ];

  presentationOptions = [
    { value: 'A', label: 'Aleatorio' },
    { value: 'F', label: 'Ordenado' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameConfigService: GameConfigurationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.gameId = Number(idParam);
        this.loadGameConfiguration();
      } else {
        this.error = 'No se proporcionó un ID';
      }
    });
  }
  

  ngOnChanges() {
    if (this.gameId !== null && this.isVisible && !this.gameConfig) {
      this.loadGameConfiguration();
    }
  }
  
  loadGameConfiguration(): void {
    if (this.gameId === null) return;

    this.isLoading = true;
    this.error = null;

    this.gameConfigService.getGameConfiguration(this.gameId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gameConfig = response.data;
        } else {
          this.error = response.message || 'Datos no disponibles';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading configuration:', err);
        this.error = 'No se pudo cargar la configuración del juego.';
        this.isLoading = false;
      }
    });
  }

  saveConfiguration() {
    if (!this.gameConfig || this.gameId === null) return;

    this.isSaving = true;
    this.error = null;

    this.gameConfigService.updateGameConfiguration(this.gameId, this.gameConfig).subscribe({
      next: (response) => {
        if (response.success) {
          this.onSave.emit(response.data);
          this.closeModal();
        } else {
          this.error = response.message || 'Error al guardar la configuración';
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving game configuration:', err);
        this.error = 'Error al guardar la configuración del juego';
        this.isSaving = false;
      }
    });
  }

  closeModal() {
    this.gameConfig = null;
    this.error = null;
    this.isLoading = false;
    this.isSaving = false;
    this.onClose.emit();
  }

  addSetting() {
    if (this.gameConfig) {
      if (!this.gameConfig.settings) {
        this.gameConfig.settings = [];
      }
      this.gameConfig.settings.push({
        key: '',
        value: ''
      });
    }
  }

  removeSetting(index: number) {
    if (this.gameConfig && this.gameConfig.settings) {
      this.gameConfig.settings.splice(index, 1);
    }
  }

  getBackgroundColor(): string {
    if (!this.gameConfig || !this.gameConfig.settings) return '#ffffff';
    
    const bgSetting = this.gameConfig.settings.find(s => s.key === 'background_color');
    return bgSetting?.value || '#ffffff';
  }

  updateBackgroundColor(color: string) {
    if (!this.gameConfig) return;
    
    if (!this.gameConfig.settings) {
      this.gameConfig.settings = [];
    }
    
    const bgSetting = this.gameConfig.settings.find(s => s.key === 'background_color');
    if (bgSetting) {
      bgSetting.value = color;
    } else {
      this.gameConfig.settings.push({
        key: 'background_color',
        value: color
      });
    }
  }

  getDifficultyLabel(value: string): string {
    const option = this.difficultyOptions.find(opt => opt.value === value);
    return option && option.label ? option.label : value;
  }

  getVisibilityLabel(value: string): string {
    const option = this.visibilityOptions.find(opt => opt.value === value);
    return option && option.label ? option.label : value;
  }

  getPresentationLabel(value: string): string {
    const option = this.presentationOptions.find(opt => opt.value === value);
    return option && option.label ? option.label : value;
  }
}