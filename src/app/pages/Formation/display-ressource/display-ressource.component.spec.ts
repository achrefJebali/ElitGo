import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayRessourceComponent } from './display-ressource.component';

describe('DisplayRessourceComponent', () => {
  let component: DisplayRessourceComponent;
  let fixture: ComponentFixture<DisplayRessourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayRessourceComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(DisplayRessourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
