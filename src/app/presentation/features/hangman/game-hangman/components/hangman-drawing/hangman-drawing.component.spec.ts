import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HangmanDrawingComponent } from './hangman-drawing.component';

describe('HangmanDrawingComponent', () => {
  let component: HangmanDrawingComponent;
  let fixture: ComponentFixture<HangmanDrawingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HangmanDrawingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HangmanDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
