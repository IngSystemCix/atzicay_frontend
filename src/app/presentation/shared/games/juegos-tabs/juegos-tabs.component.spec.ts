import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegosTabsComponent } from './juegos-tabs.component';

describe('JuegosTabsComponent', () => {
  let component: JuegosTabsComponent;
  let fixture: ComponentFixture<JuegosTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegosTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JuegosTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
