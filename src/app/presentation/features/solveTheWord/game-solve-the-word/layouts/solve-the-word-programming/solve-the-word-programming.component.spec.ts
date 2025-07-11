import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolveTheWordProgrammingComponent } from './solve-the-word-programming.component';

describe('SolveTheWordProgrammingComponent', () => {
  let component: SolveTheWordProgrammingComponent;
  let fixture: ComponentFixture<SolveTheWordProgrammingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolveTheWordProgrammingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolveTheWordProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
