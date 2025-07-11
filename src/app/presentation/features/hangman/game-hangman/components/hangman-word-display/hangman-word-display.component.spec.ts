import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HangmanWordDisplayComponent } from './hangman-word-display.component';

describe('HangmanWordDisplayComponent', () => {
  let component: HangmanWordDisplayComponent;
  let fixture: ComponentFixture<HangmanWordDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HangmanWordDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HangmanWordDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
