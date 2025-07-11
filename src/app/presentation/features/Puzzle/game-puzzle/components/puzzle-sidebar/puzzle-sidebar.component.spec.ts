import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleSidebarComponent } from './puzzle-sidebar.component';

describe('PuzzleSidebarComponent', () => {
  let component: PuzzleSidebarComponent;
  let fixture: ComponentFixture<PuzzleSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuzzleSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
