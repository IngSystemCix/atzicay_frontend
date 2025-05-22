import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreViewSolveTheWordComponent } from './pre-view-solve-the-word.component';

describe('PreViewSolveTheWordComponent', () => {
  let component: PreViewSolveTheWordComponent;
  let fixture: ComponentFixture<PreViewSolveTheWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreViewSolveTheWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreViewSolveTheWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
