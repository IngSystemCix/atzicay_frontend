import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleErrorStateComponent } from './puzzle-error-state.component';

describe('PuzzleErrorStateComponent', () => {
  let component: PuzzleErrorStateComponent;
  let fixture: ComponentFixture<PuzzleErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleErrorStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleErrorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
