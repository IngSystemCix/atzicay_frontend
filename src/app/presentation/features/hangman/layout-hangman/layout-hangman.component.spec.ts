import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutHangmanComponent } from './layout-hangman.component';

describe('LayoutHangmanComponent', () => {
  let component: LayoutHangmanComponent;
  let fixture: ComponentFixture<LayoutHangmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutHangmanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutHangmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
