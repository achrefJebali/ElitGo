import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAnnoncementComponent } from './dashboard-annoncement.component';

describe('DashboardAnnoncementComponent', () => {
  let component: DashboardAnnoncementComponent;
  let fixture: ComponentFixture<DashboardAnnoncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAnnoncementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardAnnoncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
