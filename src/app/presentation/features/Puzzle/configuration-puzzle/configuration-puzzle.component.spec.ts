import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationPuzzleComponent } from './configuration-puzzle.component';

describe('ConfigurationPuzzleComponent', () => {
  let component: ConfigurationPuzzleComponent;
  let fixture: ComponentFixture<ConfigurationPuzzleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationPuzzleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
