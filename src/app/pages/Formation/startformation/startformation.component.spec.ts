import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartFormationComponent } from './startformation.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('StartFormationComponent', () => {
  let component: StartFormationComponent;
  let fixture: ComponentFixture<StartFormationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ StartFormationComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartFormationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render lesson title', () => {
    component.formation = { title: 'Test Formation' };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.lesson-title')?.textContent).toContain('Test Formation');
  });
});
