import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-generic-config-game',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './generic-config-game.component.html',
  styleUrl: './generic-config-game.component.css'
})
export class GenericConfigGameComponent {
  @Input() settings: any = {};
  @Output() settingsChange = new EventEmitter<any>();

  onSettingChange() {
    this.settingsChange.emit(this.settings);
  }
}

