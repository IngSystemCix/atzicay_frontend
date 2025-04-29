import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMasButtonComponent } from './ver-mas-button.component';

describe('VerMasButtonComponent', () => {
  let component: VerMasButtonComponent;
  let fixture: ComponentFixture<VerMasButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMasButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerMasButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
