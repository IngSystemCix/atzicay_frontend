import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutsSolveTheWordComponent } from './layouts-solve-the-word.component';

describe('LayoutsSolveTheWordComponent', () => {
  let component: LayoutsSolveTheWordComponent;
  let fixture: ComponentFixture<LayoutsSolveTheWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutsSolveTheWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutsSolveTheWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
