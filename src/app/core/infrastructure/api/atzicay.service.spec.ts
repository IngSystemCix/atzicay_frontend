import { TestBed } from '@angular/core/testing';

import { AtzicayService } from './atzicay.service';

describe('AtzicayService', () => {
  let service: AtzicayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtzicayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
