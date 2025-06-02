import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutsMemoryComponent } from './layouts-memory.component';

describe('LayoutsMemoryComponent', () => {
  let component: LayoutsMemoryComponent;
  let fixture: ComponentFixture<LayoutsMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutsMemoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutsMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
