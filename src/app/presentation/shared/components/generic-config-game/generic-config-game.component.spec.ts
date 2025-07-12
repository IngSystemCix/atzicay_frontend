import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericConfigGameComponent } from './generic-config-game.component';

describe('GenericConfigGameComponent', () => {
  let component: GenericConfigGameComponent;
  let fixture: ComponentFixture<GenericConfigGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericConfigGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericConfigGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
