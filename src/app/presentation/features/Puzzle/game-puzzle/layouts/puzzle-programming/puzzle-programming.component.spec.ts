import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleProgrammingComponent } from './puzzle-programming.component';

describe('PuzzleProgrammingComponent', () => {
  let component: PuzzleProgrammingComponent;
  let fixture: ComponentFixture<PuzzleProgrammingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleProgrammingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
