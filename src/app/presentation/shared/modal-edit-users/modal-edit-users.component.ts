import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-edit-users',
  imports: [FormsModule],
  templateUrl: './modal-edit-users.component.html',
  styleUrl: './modal-edit-users.component.css',
})
export class ModalEditUsersComponent implements OnInit {
  @Input() userData: any;
  @Input() countries: Array<{ Id: number; Name: string }> = [];
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

  user: any;

  ngOnInit() {
    this.user = {
      name: this.userData?.name || '',
      last_name: this.userData?.last_name || '',
      gender: this.userData?.gender || 'O',
      country_id: this.userData?.country_id || '',
      city: this.userData?.city || '',
      birthdate: this.formatDateForInput(this.userData?.birthdate),
    };
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    // Si viene en formato ISO, extraer solo la fecha
    return dateString.split('T')[0];
  }

  onSubmit() {
    // Emitir solo los datos permitidos
    this.userUpdated.emit(this.user);
  }

  cerrar() {
    this.close.emit();
  }
}
