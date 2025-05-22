import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMemoryComponent } from './game-memory.component';

describe('GameMemoryComponent', () => {
  let component: GameMemoryComponent;
  let fixture: ComponentFixture<GameMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameMemoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
