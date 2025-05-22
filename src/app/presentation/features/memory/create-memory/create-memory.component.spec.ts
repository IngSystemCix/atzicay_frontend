import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMemoryComponent } from './create-memory.component';

describe('CreateMemoryComponent', () => {
  let component: CreateMemoryComponent;
  let fixture: ComponentFixture<CreateMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMemoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
