import { TestBed } from '@angular/core/testing';

import { GameProgressService } from './game-progress.service';

describe('GameProgressService', () => {
  let service: GameProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
