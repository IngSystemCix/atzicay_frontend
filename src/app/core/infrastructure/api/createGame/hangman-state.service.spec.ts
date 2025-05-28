import { TestBed } from '@angular/core/testing';

import { HangmanStateService } from './hangman-state.service';

describe('HangmanStateService', () => {
  let service: HangmanStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HangmanStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
