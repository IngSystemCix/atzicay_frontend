import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleLoadingStateComponent } from './puzzle-loading-state.component';

describe('PuzzleLoadingStateComponent', () => {
  let component: PuzzleLoadingStateComponent;
  let fixture: ComponentFixture<PuzzleLoadingStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleLoadingStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleLoadingStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
