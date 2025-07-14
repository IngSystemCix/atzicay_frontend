import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericStartGameButtonComponent } from './generic-start-game-button.component';

describe('GenericStartGameButtonComponent', () => {
  let component: GenericStartGameButtonComponent;
  let fixture: ComponentFixture<GenericStartGameButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericStartGameButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericStartGameButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
