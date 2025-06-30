import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-edit-users',
  imports: [FormsModule, CommonModule],
  templateUrl: './modal-edit-users.component.html',
  styleUrl: './modal-edit-users.component.css',
})
export class ModalEditUsersComponent implements OnInit, OnChanges {
  @Input() userData: any;
  @Input() countries: Array<{ Id: number; Name: string }> = [];
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

  user: any;

  ngOnInit() {
    console.log('Modal OnInit - userData:', this.userData);
    console.log('Modal OnInit - countries:', this.countries);
    this.initializeUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Modal OnChanges:', changes);
    if (changes['userData'] || changes['countries']) {
      this.initializeUser();
    }
  }

  private initializeUser() {
    if (this.userData) {
      this.user = {
        name: this.userData?.name || '',
        last_name: this.userData?.last_name || '',
        gender: this.userData?.gender || 'O',
        country_id: this.userData?.country_id || '',
        city: this.userData?.city || '',
        birthdate: this.formatDateForInput(this.userData?.birthdate),
      };
      
      console.log('Usuario inicializado en modal:', this.user);
      console.log('Datos originales:', this.userData);
      console.log('Países disponibles:', this.countries);
    } else {
      console.log('No se recibieron datos de usuario');
    }
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) {
      console.log('No se proporcionó fecha');
      return '';
    }
    
    console.log('Formateando fecha:', dateString);
    
    // Si viene en formato ISO, extraer solo la fecha
    const formattedDate = dateString.split('T')[0];
    console.log('Fecha formateada:', formattedDate);
    
    return formattedDate;
  }

  onSubmit() {
    console.log('Datos del formulario antes de enviar:', this.user);
    
    // Validar que todos los campos estén completos
    if (!this.user.name?.trim()) {
      alert('El nombre es requerido');
      return;
    }
    
    if (!this.user.last_name?.trim()) {
      alert('El apellido es requerido');
      return;
    }
    
    if (!this.user.gender) {
      alert('El género es requerido');
      return;
    }
    
    if (!this.user.birthdate) {
      alert('La fecha de nacimiento es requerida');
      return;
    }
    
    if (!this.user.city?.trim()) {
      alert('La ciudad es requerida');
      return;
    }
    
    if (!this.user.country_id) {
      alert('El país es requerido');
      return;
    }
    
    // Validar formato de fecha
    if (!this.isValidDate(this.user.birthdate)) {
      alert('Formato de fecha inválido');
      return;
    }
    
    // Emitir los datos validados
    const userData = {
      name: this.user.name.trim(),
      last_name: this.user.last_name.trim(),
      gender: this.user.gender,
      birthdate: this.user.birthdate,
      city: this.user.city.trim(),
      country_id: this.user.country_id,
    };
    
    console.log('Datos validados a enviar:', userData);
    this.userUpdated.emit(userData);
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    
    // Verificar formato YYYY-MM-DD
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return false;
    }
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  cerrar() {
    this.close.emit();
  }
}
