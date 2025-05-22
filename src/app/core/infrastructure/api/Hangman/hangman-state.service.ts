import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface HangmanConfiguration {
  timeLimit: number;
  theme: string;
  font: string;
  backgroundColor: string;
  fontColor: string;
  successMessage: string;
  failureMessage: string;
  publicGame: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HangmanStateService {
  private configurationSubject = new BehaviorSubject<HangmanConfiguration>({
    timeLimit: 30,
    theme: 'Claro',
    font: 'Arial',
    backgroundColor: '#ffffff',
    fontColor: '#000000',
    successMessage: '¡Felicidades!',
    failureMessage: 'Inténtalo de nuevo',
    publicGame: true
  });

  configuration$ = this.configurationSubject.asObservable();

  updateConfiguration(config: Partial<HangmanConfiguration>): void {
    const currentConfig = this.configurationSubject.value;
    this.configurationSubject.next({ ...currentConfig, ...config });
  }

  getCurrentConfiguration(): HangmanConfiguration {
    return this.configurationSubject.value;
  }
}
