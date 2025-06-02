import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreViewHangmanComponent } from './pre-view-hangman.component';

describe('PreViewHangmanComponent', () => {
  let component: PreViewHangmanComponent;
  let fixture: ComponentFixture<PreViewHangmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreViewHangmanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreViewHangmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
