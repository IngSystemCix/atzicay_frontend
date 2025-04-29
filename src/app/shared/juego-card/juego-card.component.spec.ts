import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoCardComponent } from './juego-card.component';

describe('JuegoCardComponent', () => {
  let component: JuegoCardComponent;
  let fixture: ComponentFixture<JuegoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
