import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HangmanGameComponent } from './hangman-game.component';

describe('HangmanGameComponent', () => {
  let component: HangmanGameComponent;
  let fixture: ComponentFixture<HangmanGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HangmanGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HangmanGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
