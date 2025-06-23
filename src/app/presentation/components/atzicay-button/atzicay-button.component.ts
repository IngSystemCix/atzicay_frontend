import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonType = 'primary' | 'cancel' | 'link';

@Component({
  selector: 'app-atzicay-button',
  imports: [CommonModule,RouterLink],
  templateUrl: './atzicay-button.component.html',
  styleUrl: './atzicay-button.component.css'
})
export class AtzicayButtonComponent {
  @Input() type: 'primary' | 'cancel' | 'link' = 'primary';
  @Input() label: string = 'Botón';
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() routerLink?: string;
  @Input() fullWidth: boolean = false;
  @Output() click = new EventEmitter<Event>();

}
