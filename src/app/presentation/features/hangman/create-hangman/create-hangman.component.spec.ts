import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHangmanComponent } from './create-hangman.component';

describe('CreateHangmanComponent', () => {
  let component: CreateHangmanComponent;
  let fixture: ComponentFixture<CreateHangmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHangmanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHangmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
