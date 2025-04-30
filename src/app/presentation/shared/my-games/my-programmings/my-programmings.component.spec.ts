import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProgrammingsComponent } from './my-programmings.component';

describe('MyProgrammingsComponent', () => {
  let component: MyProgrammingsComponent;
  let fixture: ComponentFixture<MyProgrammingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProgrammingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProgrammingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
