import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  OnDestroy,
  Renderer2,
  Inject,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-filter-dropdown',
  imports: [CommonModule],
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.css'
})
export class FilterDropdownComponent implements OnDestroy {
  @Input() gameTypes: { label: string; value: string }[] = [];
  @Input() selectedType: string | null = null;
  @Output() selectedTypeChange = new EventEmitter<string | null>();
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  dropdownStyles = { top: '0px', left: '0px' };
  private dropdownElement: HTMLElement | null = null;

  @ViewChild('triggerBtn', { static: false }) triggerBtn!: ElementRef;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  toggle(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.createDropdownInBody();
      this.updateDropdownPosition();
    } else {
      this.removeDropdownFromBody();
      this.closed.emit();
    }
  }

  private createDropdownInBody(): void {
    // Crear el elemento dropdown
    this.dropdownElement = this.renderer.createElement('div');
    this.renderer.setAttribute(this.dropdownElement, 'id', 'filter-dropdown-portal');
    
    // Aplicar clases CSS
    const classes = [
      'fixed', 'z-[999999]', 'w-72', 'border', 'border-gray-100/50', 
      'ring-1', 'ring-black/5', 'bg-white/95', 'backdrop-blur-md', 
      'rounded-2xl', 'shadow-2xl', 'py-3'
    ];
    classes.forEach(cls => this.renderer.addClass(this.dropdownElement, cls));

    // Crear el contenido del dropdown
    this.dropdownElement!.innerHTML = `
      <div class="px-6 py-4 text-sm text-atzicay-dropdown-text font-semibold border-b border-gray-100/70 bg-gray-50/50">
        🎯 Tipo de Juego
      </div>
      ${this.gameTypes.map(type => `
        <div class="flex items-center px-6 py-3 text-sm text-atzicay-dropdown-text hover:bg-atzicay-purple-50/70 transition-all duration-200 cursor-pointer rounded-lg mx-2" 
             data-type-value="${type.value}">
          <input type="radio" 
                 id="filterType_${type.value}_portal" 
                 name="gameTypePortal" 
                 value="${type.value}" 
                 ${this.selectedType === type.value ? 'checked' : ''}
                 class="mr-4 rounded-full text-atzicay-purple-500 focus:ring-atzicay-purple-500 scale-110" />
          <label for="filterType_${type.value}_portal" class="cursor-pointer font-medium flex-1">
            ${type.label}
          </label>
        </div>
      `).join('')}
      <div class="border-t border-gray-100/70 mt-3 pt-3 px-6">
        <button id="clear-filters-portal" 
                class="w-full text-sm text-atzicay-purple-500 hover:text-atzicay-purple-700 py-2.5 text-center transition-all duration-200 font-medium rounded-lg hover:bg-atzicay-purple-50/50">
          🗑️ Limpiar filtros
        </button>
      </div>
    `;

    // Agregar event listeners
    this.gameTypes.forEach(type => {
      const typeElement = this.dropdownElement!.querySelector(`[data-type-value="${type.value}"]`);
      if (typeElement) {
        this.renderer.listen(typeElement, 'click', () => this.selectType(type.value));
      }
    });

    const clearButton = this.dropdownElement!.querySelector('#clear-filters-portal');
    if (clearButton) {
      this.renderer.listen(clearButton, 'click', () => this.clearFilters());
    }

    // Agregar al body
    this.renderer.appendChild(this.document.body, this.dropdownElement);
  }

  private updateDropdownPosition(): void {
    if (!this.dropdownElement || !this.triggerBtn) return;

    const rect = this.triggerBtn.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(this.dropdownElement, 'top', `${rect.bottom + window.scrollY + 8}px`);
    this.renderer.setStyle(this.dropdownElement, 'left', `${rect.left + window.scrollX}px`);
  }

  private removeDropdownFromBody(): void {
    if (this.dropdownElement) {
      this.renderer.removeChild(this.document.body, this.dropdownElement);
      this.dropdownElement = null;
    }
  }

  selectType(value: string): void {
    this.selectedTypeChange.emit(value);
    this.isOpen = false;
    this.removeDropdownFromBody();
  }

  clearFilters(): void {
    this.selectedTypeChange.emit(null);
    this.isOpen = false;
    this.removeDropdownFromBody();
  }

  ngOnDestroy(): void {
    this.removeDropdownFromBody();
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  onWindowChange(): void {
    if (this.isOpen && this.dropdownElement) {
      this.updateDropdownPosition();
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      !this.triggerBtn?.nativeElement.contains(target) &&
      !this.dropdownElement?.contains(target)
    ) {
      this.isOpen = false;
      this.removeDropdownFromBody();
      this.closed.emit();
    }
  }
}
