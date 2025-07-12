import { Directive, ElementRef, Input, OnInit, Renderer2, inject } from '@angular/core';
import { CacheBustingService } from '../../core/infrastructure/service/cache-busting.service';

@Directive({
  selector: '[appSmartImage]',
  standalone: true
})
export class SmartImageDirective implements OnInit {
  @Input() appSmartImage: string = '';
  @Input() fallbackImage: string = 'assets/default-game.png';
  @Input() isDynamic: boolean = false; 
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private cacheBustingService = inject(CacheBustingService);

  ngOnInit() {
    this.loadImage();
  }

  private loadImage() {
    if (!this.appSmartImage) {
      this.setFallbackImage();
      return;
    }

    const imageUrl = this.isDynamic 
      ? this.cacheBustingService.applyGameImageCacheBusting(this.appSmartImage)
      : this.cacheBustingService.applyCacheBusting(this.appSmartImage);

    this.cacheBustingService.preloadAndVerifyImage(imageUrl)
      .then((verifiedUrl) => {
        this.renderer.setAttribute(this.el.nativeElement, 'src', verifiedUrl);
      })
      .catch(() => {
        console.warn(`Failed to load image: ${imageUrl}, using fallback`);
        this.setFallbackImage();
      });
  }

  private setFallbackImage() {
    const fallbackUrl = this.cacheBustingService.applyCacheBusting(this.fallbackImage);
    this.renderer.setAttribute(this.el.nativeElement, 'src', fallbackUrl);
  }
}
