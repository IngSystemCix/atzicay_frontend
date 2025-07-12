import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipEl: HTMLElement | null = null;
  private arrowEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.tooltipText) return;
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.removeTooltip();
  }

  ngOnDestroy() {
    this.removeTooltip();
  }

  private showTooltip() {
    // Tooltip contenedor
    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.setStyle(this.tooltipEl, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipEl, 'background', '#333');
    this.renderer.setStyle(this.tooltipEl, 'color', '#fff');
    this.renderer.setStyle(this.tooltipEl, 'padding', '6px 10px');
    this.renderer.setStyle(this.tooltipEl, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipEl, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipEl, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipEl, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipEl, 'transition', 'opacity 0.15s ease-in-out');
    this.renderer.setStyle(this.tooltipEl, 'opacity', '0');

    if (this.tooltipEl) {
      this.tooltipEl.innerText = this.tooltipText;
    }

    // Flecha (arrow)
    this.arrowEl = this.renderer.createElement('div');
    this.renderer.setStyle(this.arrowEl, 'width', '0');
    this.renderer.setStyle(this.arrowEl, 'height', '0');
    this.renderer.setStyle(this.arrowEl, 'position', 'absolute');

    this.renderer.appendChild(this.tooltipEl, this.arrowEl);
    this.renderer.appendChild(document.body, this.tooltipEl);

    this.setPosition();
    setTimeout(() => {
      if (this.tooltipEl) {
        this.renderer.setStyle(this.tooltipEl, 'opacity', '1');
      }
    }, 10);
  }

  private setPosition() {
    if (!this.tooltipEl || !this.arrowEl) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipEl.getBoundingClientRect();

    let top = 0;
    let left = 0;

    // Reset arrow styles
    const arrowSize = 8;
    this.renderer.setStyle(this.arrowEl, 'border', 'solid transparent');
    this.renderer.setStyle(this.arrowEl, 'border-width', `${arrowSize}px`);
    this.renderer.setStyle(this.arrowEl, 'transform', 'rotate(0deg)');

    switch (this.position) {
      case 'top':
        top = hostPos.top - tooltipPos.height - arrowSize;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

        this.renderer.setStyle(this.arrowEl, 'bottom', '-16px');
        this.renderer.setStyle(this.arrowEl, 'left', '50%');
        this.renderer.setStyle(this.arrowEl, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(this.arrowEl, 'border-top-color', '#333');
        break;

      case 'bottom':
        top = hostPos.bottom + arrowSize;
        left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

        this.renderer.setStyle(this.arrowEl, 'top', '-16px');
        this.renderer.setStyle(this.arrowEl, 'left', '50%');
        this.renderer.setStyle(this.arrowEl, 'transform', 'translateX(-50%)');
        this.renderer.setStyle(this.arrowEl, 'border-bottom-color', '#333');
        break;

      case 'left':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left - tooltipPos.width - arrowSize;

        this.renderer.setStyle(this.arrowEl, 'top', '50%');
        this.renderer.setStyle(this.arrowEl, 'right', '-16px');
        this.renderer.setStyle(this.arrowEl, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(this.arrowEl, 'border-left-color', '#333');
        break;

      case 'right':
        top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + arrowSize;

        this.renderer.setStyle(this.arrowEl, 'top', '50%');
        this.renderer.setStyle(this.arrowEl, 'left', '-16px');
        this.renderer.setStyle(this.arrowEl, 'transform', 'translateY(-50%)');
        this.renderer.setStyle(this.arrowEl, 'border-right-color', '#333');
        break;
    }

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  private removeTooltip() {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
      this.arrowEl = null;
    }
  }
}
