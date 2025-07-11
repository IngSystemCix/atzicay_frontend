import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolveTheWordGameComponent } from './solve-the-word-game.component';

describe('SolveTheWordGameComponent', () => {
  let component: SolveTheWordGameComponent;
  let fixture: ComponentFixture<SolveTheWordGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolveTheWordGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolveTheWordGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
