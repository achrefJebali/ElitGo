import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSettingsComponent } from './dashboard-settings.component';

describe('DashboardSettingsComponent', () => {
  let component: DashboardSettingsComponent;
  let fixture: ComponentFixture<DashboardSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
