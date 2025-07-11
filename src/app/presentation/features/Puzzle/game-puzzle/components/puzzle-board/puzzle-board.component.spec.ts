import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleBoardComponent } from './puzzle-board.component';

describe('PuzzleBoardComponent', () => {
  let component: PuzzleBoardComponent;
  let fixture: ComponentFixture<PuzzleBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
