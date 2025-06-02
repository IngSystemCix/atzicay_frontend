import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutsPuzzleComponent } from './layouts-puzzle.component';

describe('LayoutsPuzzleComponent', () => {
  let component: LayoutsPuzzleComponent;
  let fixture: ComponentFixture<LayoutsPuzzleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutsPuzzleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutsPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
