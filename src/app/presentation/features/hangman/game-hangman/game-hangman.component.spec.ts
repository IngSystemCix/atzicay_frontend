import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHangmanComponent } from './game-hangman.component';

describe('GameHangmanComponent', () => {
  let component: GameHangmanComponent;
  let fixture: ComponentFixture<GameHangmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHangmanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameHangmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
