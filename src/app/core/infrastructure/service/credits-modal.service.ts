import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CreditsModalComponent } from '../../../presentation/components/credits-modal/credits-modal.component';

@Injectable({
  providedIn: 'root'
})
export class CreditsModalService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  open(): void {
    if (this.overlayRef) {
      return; // Modal ya está abierto
    }

    // Configuración del overlay
    const overlayConfig = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.overlayRef = this.overlay.create({
      positionStrategy: overlayConfig,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'credits-modal-panel'
    });

    // Crear el portal del componente
    const portal = new ComponentPortal(CreditsModalComponent);
    const componentRef = this.overlayRef.attach(portal);

    // Manejar el cierre
    componentRef.instance.close.subscribe(() => {
      this.close();
    });

    // Cerrar al hacer clic en el backdrop
    this.overlayRef.backdropClick().subscribe(() => {
      this.close();
    });
  }

  close(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}