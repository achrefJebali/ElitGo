import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoweventBACKComponent } from './showevent-back.component';

describe('ShoweventBACKComponent', () => {
  let component: ShoweventBACKComponent;
  let fixture: ComponentFixture<ShoweventBACKComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoweventBACKComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoweventBACKComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
