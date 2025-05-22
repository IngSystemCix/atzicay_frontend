import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-modal-edit-users',
  imports: [
    FormsModule
  ],
  templateUrl: './modal-edit-users.component.html',
  styleUrl: './modal-edit-users.component.css'
})
export class ModalEditUsersComponent {
  @Input() userData: any;
  @Input() countries: Array<{ Id: number; Name: string }> = [];
  @Output() close = new EventEmitter<void>();
  user: any;

  ngOnInit() {
    this.user = { ...this.userData }; // Copia para editar sin afectar el original hasta guardar
  }

  onSubmit() {
    // Aquí puedes emitir cambios o hacer llamadas al backend
    console.log('Usuario actualizado:', this.user);
    this.close.emit(); // Cierra el modal
  }

  cerrar() {
    this.close.emit();
  }

}
