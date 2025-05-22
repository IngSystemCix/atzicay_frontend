import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationHangmanComponent } from './configuration-hangman.component';

describe('ConfigurationHangmanComponent', () => {
  let component: ConfigurationHangmanComponent;
  let fixture: ComponentFixture<ConfigurationHangmanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationHangmanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationHangmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
