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
    // Mapear los datos correctamente desde el formato del API
    this.user = {
      name: this.userData?.name || '',
      lastName: this.userData?.lastName || '',
      email: this.userData?.email || '',
      gender: this.userData?.gender || 'O',
      countryId: this.userData?.countryId || 1,
      city: this.userData?.city || '',
      birthdate: this.formatDateForInput(this.userData?.birthdate),
      activated: this.userData?.activated || true,
    };
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    // Si viene en formato ISO, extraer solo la fecha
    return dateString.split('T')[0];
  }

  onSubmit() {
    // Emitir los datos actualizados
    this.userUpdated.emit(this.user);
    console.log('Usuario actualizado:', this.user);
    // No cerrar aquí, lo hará el componente padre después de la actualización exitosa
  }

  cerrar() {
    this.close.emit();
  }
}
