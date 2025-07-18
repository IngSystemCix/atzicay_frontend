import { Platform } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CreateGameService } from '../../../../core/infrastructure/api/create-game.service';
import { AlertService } from '../../../../core/infrastructure/service/alert.service';
import { UserSessionService } from '../../../../core/infrastructure/service/user-session.service';
import { GenericConfigGameComponent } from '../../../components/generic-config-game/generic-config-game.component';
import { TooltipDirective } from '../../../shared/tooltip/tooltip.directive';
@Component({
  selector: 'app-layouts-puzzle',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericConfigGameComponent, TooltipDirective],
  templateUrl: './layouts-puzzle.component.html',
  styleUrl: './layouts-puzzle.component.css',
})
export class LayoutsPuzzleComponent implements OnInit {
  activeTab: string = 'contenido';
  isLoading: boolean = false;
  isMobile = false;

  contentForm!: FormGroup;
  configForm!: FormGroup;

  selectedImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  fonts = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New'];
  colores = [
    { name: 'gray', class: 'bg-gray-400' },
    { name: 'blue', class: 'bg-blue-400' },
    { name: 'purple', class: 'bg-purple-400' },
    {
      name: 'rainbow',
      class: 'bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400',
    },
  ];

  userId: number = 0;

  constructor(
    private fb: FormBuilder,
    private createGameService: CreateGameService,
    private userSession: UserSessionService,
    private alertService: AlertService,
    private router: Router,
    private platform: Platform,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.initializeForms();
    this.checkViewport();

    // Listen for window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkViewport());
    }
  }

  ngOnDestroy() {
    // Clean up event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', () => this.checkViewport());
    }

    // Liberar todas las URLs de objetos creadas
    if (this.selectedImage && typeof this.selectedImage === 'string') {
      URL.revokeObjectURL(this.selectedImage);
    }
  }

  generatePreview(): any[] {
    const rows = this.contentForm.get('filas')?.value || 4;
    const cols = this.contentForm.get('columnas')?.value || 4;

    // Show fewer pieces on mobile
    const maxPieces = this.isMobile ? 8 : 16;
    const totalPieces = rows * cols;
    const showPieces = Math.min(totalPieces, maxPieces);

    return Array(showPieces)
      .fill(0)
      .map((_, i) => ({
        id: i,
        position: i,
        isFlipped: false,
        isMatched: false,
      }));
  }

  private checkViewport() {
    this.isMobile = window.innerWidth < 768;
  }
  private initializeForms(): void {
    this.contentForm = this.fb.group({
      tituloJuego: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      filas: [4, [Validators.required, Validators.min(2), Validators.max(10)]],
      columnas: [
        4,
        [Validators.required, Validators.min(2), Validators.max(10)],
      ],
      mostrarPista: [false],
      pista: [''],
      ayudaAutomatica: [false],
      tiempo: [
        180,
        [Validators.required, Validators.min(30), Validators.max(3600)],
      ],
    });

    this.configForm = this.fb.group({
      font: ["Arial", Validators.required],
      backgroundColor: ['#cccccc', Validators.required],
      fontColor: ['#000000', Validators.required],
      successMessage: [
        '¡Excelente trabajo!',
        [Validators.required, Validators.minLength(3)],
      ],
      failureMessage: [
        'Inténtalo de nuevo',
        [Validators.required, Validators.minLength(3)],
      ],
      difficulty: ['M', Validators.required],
      visibility: ['P', Validators.required],
    });

    // Configurar validación condicional para la pista
    this.contentForm
      .get('mostrarPista')
      ?.valueChanges.subscribe((mostrarPista) => {
        const pistaControl = this.contentForm.get('pista');
        if (mostrarPista) {
          pistaControl?.setValidators([
            Validators.required,
            Validators.minLength(5),
          ]);
        } else {
          pistaControl?.clearValidators();
        }
        pistaControl?.updateValueAndValidity();
      });
  }

  ngOnInit(): void {
    const id = this.userSession.getUserId();
    if (id) this.userId = id;

    // Forzar la actualización de formularios y valores por defecto en configForm
    this.forceFormValuesUpdate();

    // Asegurar valores por defecto visibles en la pestaña de configuración
    this.configForm.patchValue({
      font: "Arial",
      backgroundColor: '#cccccc',
      fontColor: '#000000',
      successMessage: '¡Excelente trabajo!',
      failureMessage: 'Inténtalo de nuevo',
      difficulty: 'M',
      visibility: 'P',
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    // Si cambiamos a la pestaña de configuración, forzar la actualización de valores
    if (tab === 'configuracion') {
      this.forceFormValuesUpdate();
    }
  }

  selectColor(tipo: 'backgroundColor' | 'fontColor', color: string) {
    if (tipo === 'backgroundColor') {
      this.configForm.patchValue({ backgroundColor: color });
    } else {
      this.configForm.patchValue({ fontColor: color });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!this.validateImageFile(file)) {
      event.target.value = '';
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  private validateImageFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.alertService.showError(
        'Tipo de archivo no permitido. Solo PNG, JPG, JPEG'
      );
      return false;
    }
    if (file.size > 1024 * 1024) {
      this.alertService.showError('La imagen debe ser menor a 1MB');
      return false;
    }
    return true;
  }

  isFormValid(): boolean {
    return (
      this.contentForm.valid &&
      this.configForm.valid &&
      this.selectedFile !== null
    );
  }

  private markAllAsTouched(): void {
    this.contentForm.markAllAsTouched();
    this.configForm.markAllAsTouched();
  }

  /**
   * Fuerza la actualización visual de los formularios
   */
  private forceFormValuesUpdate(): void {
    // Forzar detección de cambios en los formularios
    setTimeout(() => {
      this.contentForm.updateValueAndValidity();
      this.configForm.updateValueAndValidity();

      // Asegurar que todos los valores por defecto estén visibles
      this.configForm.patchValue({
        font: this.configForm.get('font')?.value || this.fonts[0],
        backgroundColor: this.configForm.get('backgroundColor')?.value || '#cccccc',
        fontColor: this.configForm.get('fontColor')?.value || '#000000',
        successMessage:
          this.configForm.get('successMessage')?.value || '¡Excelente trabajo!',
        failureMessage:
          this.configForm.get('failureMessage')?.value || 'Inténtalo de nuevo',
        difficulty: this.configForm.get('difficulty')?.value || 'M',
        visibility: this.configForm.get('visibility')?.value || 'P',
      });
    }, 0);
  }

  // Métodos de validación para el template
  get isTitleInvalid(): boolean {
    const control = this.contentForm.get('tituloJuego');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isDescriptionInvalid(): boolean {
    const control = this.contentForm.get('descripcion');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isRowsInvalid(): boolean {
    const control = this.contentForm.get('filas');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isColumnsInvalid(): boolean {
    const control = this.contentForm.get('columnas');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isTimeInvalid(): boolean {
    const control = this.contentForm.get('tiempo');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get isClueInvalid(): boolean {
    const control = this.contentForm.get('pista');
    const showClue = this.contentForm.get('mostrarPista')?.value;
    return !!(
      showClue &&
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  get hasImageError(): boolean {
    const titleTouched = this.contentForm.get('tituloJuego')?.touched || false;
    const descTouched = this.contentForm.get('descripcion')?.touched || false;
    return !this.selectedFile && (titleTouched || descTouched);
  }

  getTitleErrorMessage(): string {
    const control = this.contentForm.get('tituloJuego');
    if (control?.hasError('required')) {
      return 'El título del juego es requerido';
    }
    if (control?.hasError('minlength')) {
      return 'El título debe tener al menos 3 caracteres';
    }
    return '';
  }

  getDescriptionErrorMessage(): string {
    const control = this.contentForm.get('descripcion');
    if (control?.hasError('required')) {
      return 'La descripción es requerida';
    }
    if (control?.hasError('minlength')) {
      return 'La descripción debe tener al menos 10 caracteres';
    }
    return '';
  }

  getRowsErrorMessage(): string {
    const control = this.contentForm.get('filas');
    if (control?.hasError('required')) {
      return 'El número de filas es requerido';
    }
    if (control?.hasError('min') || control?.hasError('max')) {
      return 'Las filas deben estar entre 2 y 10';
    }
    return '';
  }

  getColumnsErrorMessage(): string {
    const control = this.contentForm.get('columnas');
    if (control?.hasError('required')) {
      return 'El número de columnas es requerido';
    }
    if (control?.hasError('min') || control?.hasError('max')) {
      return 'Las columnas deben estar entre 2 y 10';
    }
    return '';
  }

  getTimeErrorMessage(): string {
    const control = this.contentForm.get('tiempo');
    if (control?.hasError('required')) {
      return 'El tiempo límite es requerido';
    }
    if (control?.hasError('min')) {
      return 'El tiempo mínimo es de 30 segundos';
    }
    if (control?.hasError('max')) {
      return 'El tiempo máximo es de 3600 segundos (1 hora)';
    }
    return '';
  }

  getClueErrorMessage(): string {
    const control = this.contentForm.get('pista');
    if (control?.hasError('required')) {
      return 'La pista es requerida cuando está habilitada';
    }
    if (control?.hasError('minlength')) {
      return 'La pista debe tener al menos 5 caracteres';
    }
    return '';
  }

  async guardar() {
    this.isLoading = true;
    this.markAllAsTouched();

    if (!this.isFormValid()) {
      let errorMessage =
        'Por favor completa todos los campos requeridos correctamente.';

      if (!this.selectedFile) {
        errorMessage = 'Debe seleccionar una imagen para el puzzle.';
      } else if (this.contentForm.invalid) {
        errorMessage = 'Por favor revisa la información del juego.';
      } else if (this.configForm.invalid) {
        errorMessage = 'Por favor revisa la configuración del juego.';
      }

      this.alertService.showError(errorMessage);
      this.isLoading = false;
      return;
    }

    try {
      let pathImg = '';
      if (this.selectedFile) {
        pathImg = await this.readFileAsBase64(this.selectedFile);
      }

      const contentData = this.contentForm.value;
      const configData = this.configForm.value;

      const data = {
        Name: contentData.tituloJuego.trim(),
        Description: contentData.descripcion.trim(),
        Activated: true,
        Difficulty: configData.difficulty,
        Visibility: configData.visibility,
        PathImg: pathImg,
        Clue: contentData.mostrarPista ? contentData.pista : '',
        Rows: contentData.filas,
        Cols: contentData.columnas,
        AutomaticHelp: !!contentData.ayudaAutomatica,
        Settings: [
          { ConfigKey: 'time_limit', ConfigValue: contentData.tiempo.toString() },
          { ConfigKey: 'font', ConfigValue: configData.font },
          { ConfigKey: 'backgroundColor', ConfigValue: configData.backgroundColor },
          { ConfigKey: 'fontColor', ConfigValue: configData.fontColor },
          { ConfigKey: 'successMessage', ConfigValue: configData.successMessage },
          { ConfigKey: 'failureMessage', ConfigValue: configData.failureMessage },
        ],
      };

      this.createGameService
        .createPuzzleGame(this.userId, { gameType: 'puzzle', data })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.alertService.showGameCreatedSuccess('Puzzle');
            setTimeout(() => this.resetForm(), 2000);
          },
          error: (error) => {
            this.isLoading = false;
            this.alertService.showGameCreationError(error, 'puzzle');
          },
        });
    } catch (error) {
      this.isLoading = false;
      this.alertService.showError(
        'Error inesperado al procesar la imagen o los datos'
      );
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        reject('Tipo de archivo no permitido. Solo PNG, JPG, JPEG');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string); // Siempre incluye el prefijo data:image/...;base64,
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  async cancelar(): Promise<void> {
    const shouldCancel = await this.alertService.showCancelGameCreation('Rompecabezas');
    if (shouldCancel) {
      this.alertService.showCancellationSuccess('Rompecabezas');
      this.router.navigate(['/juegos']);
    }
  }

  private resetForm() {
    this.contentForm.reset({
      tituloJuego: '',
      descripcion: '',
      filas: 4,
      columnas: 4,
      mostrarPista: false,
      pista: '',
      ayudaAutomatica: false,
      tiempo: 180,
    });

    // Usar setValue para asegurar que los valores por defecto se reflejen en el formulario y el componente genérico
    this.configForm.setValue({
      font: this.fonts[0],
      backgroundColor: '#cccccc',
      fontColor: '#000000',
      successMessage: '¡Excelente trabajo!',
      failureMessage: 'Inténtalo de nuevo',
      difficulty: 'M',
      visibility: 'P',
    });

    this.selectedImage = null;
    this.selectedFile = null;
    this.activeTab = 'contenido';
  }

  /**
   * Maneja los cambios de configuración desde el componente genérico
   */
  onSettingsChange(settings: any): void {
    this.configForm.patchValue(settings);
  }
}
