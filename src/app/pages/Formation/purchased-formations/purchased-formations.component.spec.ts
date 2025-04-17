import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedFormationsComponent } from './purchased-formations.component';

describe('PurchasedFormationsComponent', () => {
  let component: PurchasedFormationsComponent;
  let fixture: ComponentFixture<PurchasedFormationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasedFormationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurchasedFormationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
