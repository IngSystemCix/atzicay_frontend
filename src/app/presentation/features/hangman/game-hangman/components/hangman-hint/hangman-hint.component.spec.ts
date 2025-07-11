import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HangmanHintComponent } from './hangman-hint.component';

describe('HangmanHintComponent', () => {
  let component: HangmanHintComponent;
  let fixture: ComponentFixture<HangmanHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HangmanHintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HangmanHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
