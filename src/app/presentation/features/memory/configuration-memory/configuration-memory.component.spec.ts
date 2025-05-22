import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationMemoryComponent } from './configuration-memory.component';

describe('ConfigurationMemoryComponent', () => {
  let component: ConfigurationMemoryComponent;
  let fixture: ComponentFixture<ConfigurationMemoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationMemoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
