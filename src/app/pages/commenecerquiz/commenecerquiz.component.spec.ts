import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommenecerquizComponent } from './commenecerquiz.component';

describe('CommenecerquizComponent', () => {
  let component: CommenecerquizComponent;
  let fixture: ComponentFixture<CommenecerquizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommenecerquizComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommenecerquizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
