import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayBackComponent } from './display-back.component';

describe('DisplayBackComponent', () => {
  let component: DisplayBackComponent;
  let fixture: ComponentFixture<DisplayBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayBackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
