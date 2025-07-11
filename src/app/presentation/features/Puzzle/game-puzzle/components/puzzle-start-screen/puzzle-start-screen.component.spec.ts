import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleStartScreenComponent } from './puzzle-start-screen.component';

describe('PuzzleStartScreenComponent', () => {
  let component: PuzzleStartScreenComponent;
  let fixture: ComponentFixture<PuzzleStartScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleStartScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleStartScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
