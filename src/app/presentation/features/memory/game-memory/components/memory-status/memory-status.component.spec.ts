import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryStatusComponent } from './memory-status.component';

describe('MemoryStatusComponent', () => {
  let component: MemoryStatusComponent;
  let fixture: ComponentFixture<MemoryStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
