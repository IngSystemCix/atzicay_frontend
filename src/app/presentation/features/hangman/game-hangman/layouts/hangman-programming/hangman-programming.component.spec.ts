import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HangmanProgrammingComponent } from './hangman-programming.component';

describe('HangmanProgrammingComponent', () => {
  let component: HangmanProgrammingComponent;
  let fixture: ComponentFixture<HangmanProgrammingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HangmanProgrammingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HangmanProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
