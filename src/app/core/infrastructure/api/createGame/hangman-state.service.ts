import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {HangmanFormData} from '../../../domain/interface/hangman-form';

@Injectable({
  providedIn: 'root'
})
export class HangmanStateService {
  private hangmanData = new BehaviorSubject<HangmanFormData | null>(null);

  setHangmanData(data: HangmanFormData): void {
    this.hangmanData.next(data);
  }

  getHangmanData(): HangmanFormData | null {
    return this.hangmanData.value;
  }
}
