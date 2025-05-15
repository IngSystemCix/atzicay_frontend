import { TestBed } from '@angular/core/testing';

import { GameSettingService } from './game-setting.service';

describe('GameSettingService', () => {
  let service: GameSettingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSettingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
