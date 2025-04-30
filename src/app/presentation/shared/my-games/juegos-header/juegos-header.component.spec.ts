import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegosHeaderComponent } from './juegos-header.component';

describe('JuegosHeaderComponent', () => {
  let component: JuegosHeaderComponent;
  let fixture: ComponentFixture<JuegosHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegosHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegosHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
