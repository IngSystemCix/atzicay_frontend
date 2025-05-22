import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationSolveTheWordComponent } from './configuration-solve-the-word.component';

describe('ConfigurationSolveTheWordComponent', () => {
  let component: ConfigurationSolveTheWordComponent;
  let fixture: ComponentFixture<ConfigurationSolveTheWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationSolveTheWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationSolveTheWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
