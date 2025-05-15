import { TestBed } from '@angular/core/testing';

import { SolveTheWordService } from './solve-the-word.service';

describe('SolveTheWordService', () => {
  let service: SolveTheWordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolveTheWordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
