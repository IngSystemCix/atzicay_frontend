import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleClueComponent } from './puzzle-clue.component';

describe('PuzzleClueComponent', () => {
  let component: PuzzleClueComponent;
  let fixture: ComponentFixture<PuzzleClueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleClueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleClueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
