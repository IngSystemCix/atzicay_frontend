import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleCompleteScreenComponent } from './puzzle-complete-screen.component';

describe('PuzzleCompleteScreenComponent', () => {
  let component: PuzzleCompleteScreenComponent;
  let fixture: ComponentFixture<PuzzleCompleteScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleCompleteScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleCompleteScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
