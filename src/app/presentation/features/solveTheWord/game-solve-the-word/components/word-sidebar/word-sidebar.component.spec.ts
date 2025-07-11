import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordSidebarComponent } from './word-sidebar.component';

describe('WordSidebarComponent', () => {
  let component: WordSidebarComponent;
  let fixture: ComponentFixture<WordSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
