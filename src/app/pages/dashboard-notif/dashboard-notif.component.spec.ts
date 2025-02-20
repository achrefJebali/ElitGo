import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardNotifComponent } from './dashboard-notif.component';

describe('DashboardNotifComponent', () => {
  let component: DashboardNotifComponent;
  let fixture: ComponentFixture<DashboardNotifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardNotifComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardNotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
