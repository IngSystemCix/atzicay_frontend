import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSolveTheWordComponent } from './game-solve-the-word.component';

describe('GameSolveTheWordComponent', () => {
  let component: GameSolveTheWordComponent;
  let fixture: ComponentFixture<GameSolveTheWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSolveTheWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSolveTheWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
