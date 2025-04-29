import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoCardMenuComponent } from './juego-card-menu.component';

describe('JuegoCardMenuComponent', () => {
  let component: JuegoCardMenuComponent;
  let fixture: ComponentFixture<JuegoCardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegoCardMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegoCardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
