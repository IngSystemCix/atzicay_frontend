import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtzicayButtonComponent } from './atzicay-button.component';

describe('AtzicayButtonComponent', () => {
  let component: AtzicayButtonComponent;
  let fixture: ComponentFixture<AtzicayButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtzicayButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtzicayButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
