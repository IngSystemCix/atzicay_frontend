import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtzicayTabsComponent } from './atzicay-tabs.component';

describe('AtzicayTabsComponent', () => {
  let component: AtzicayTabsComponent;
  let fixture: ComponentFixture<AtzicayTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtzicayTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtzicayTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
