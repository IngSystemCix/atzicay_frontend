import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryProgrammingComponent } from './memory-programming.component';

describe('MemoryProgrammingComponent', () => {
  let component: MemoryProgrammingComponent;
  let fixture: ComponentFixture<MemoryProgrammingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryProgrammingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoryProgrammingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
