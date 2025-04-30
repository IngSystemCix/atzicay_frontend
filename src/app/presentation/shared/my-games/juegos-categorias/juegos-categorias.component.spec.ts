import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegosCategoriasComponent } from './juegos-categorias.component';

describe('JuegosCategoriasComponent', () => {
  let component: JuegosCategoriasComponent;
  let fixture: ComponentFixture<JuegosCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegosCategoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegosCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
