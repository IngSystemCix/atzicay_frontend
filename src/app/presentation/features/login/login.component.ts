import { Component } from '@angular/core';
import { ModalComponent } from "../../shared/modal/modal.component";

@Component({
  selector: 'app-login',
  imports: [ModalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  protected showModal: boolean = false;
  handleOpenModal = () => {
    this.showModal = true;
  }
  handleCloseModal = () => {
    this.showModal = false;
  }
}


