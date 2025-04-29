import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegosFiltrosComponent } from './juegos-filtros.component';

describe('JuegosFiltrosComponent', () => {
  let component: JuegosFiltrosComponent;
  let fixture: ComponentFixture<JuegosFiltrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegosFiltrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegosFiltrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
