import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLoadingStatesComponent } from './game-loading-states.component';

describe('GameLoadingStatesComponent', () => {
  let component: GameLoadingStatesComponent;
  let fixture: ComponentFixture<GameLoadingStatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLoadingStatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameLoadingStatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
