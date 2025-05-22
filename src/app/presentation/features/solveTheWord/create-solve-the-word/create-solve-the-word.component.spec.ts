import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSolveTheWordComponent } from './create-solve-the-word.component';

describe('CreateSolveTheWordComponent', () => {
  let component: CreateSolveTheWordComponent;
  let fixture: ComponentFixture<CreateSolveTheWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSolveTheWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSolveTheWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
