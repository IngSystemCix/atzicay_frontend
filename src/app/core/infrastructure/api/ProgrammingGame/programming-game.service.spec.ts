import { TestBed } from '@angular/core/testing';

import { ProgrammingGameService } from './programming-game.service';

describe('ProgrammingGameService', () => {
  let service: ProgrammingGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgrammingGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
