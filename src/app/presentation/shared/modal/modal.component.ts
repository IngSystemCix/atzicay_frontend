import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() visible !: boolean ;
  @Output() closeModal = new EventEmitter<void>();
  handleCloseModal() {
    this.closeModal.emit();
  }
}
