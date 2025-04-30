import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegosListaComponent } from './juegos-lista.component';

describe('JuegosListaComponent', () => {
  let component: JuegosListaComponent;
  let fixture: ComponentFixture<JuegosListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegosListaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegosListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
