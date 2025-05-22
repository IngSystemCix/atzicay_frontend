import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreViewPuzzleComponent } from './pre-view-puzzle.component';

describe('PreViewPuzzleComponent', () => {
  let component: PreViewPuzzleComponent;
  let fixture: ComponentFixture<PreViewPuzzleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreViewPuzzleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreViewPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
