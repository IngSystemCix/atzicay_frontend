import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreViewMemoryComponent } from './pre-view-memory.component';

describe('PreViewMemoryComponent', () => {
  let component: PreViewMemoryComponent;
  let fixture: ComponentFixture<PreViewMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreViewMemoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreViewMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
