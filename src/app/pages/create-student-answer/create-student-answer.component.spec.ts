import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStudentAnswerComponent } from './create-student-answer.component';

describe('CreateStudentAnswerComponent', () => {
  let component: CreateStudentAnswerComponent;
  let fixture: ComponentFixture<CreateStudentAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateStudentAnswerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateStudentAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
