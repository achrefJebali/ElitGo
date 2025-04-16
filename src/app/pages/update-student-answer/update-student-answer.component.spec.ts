import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStudentAnswerComponent } from './update-student-answer.component';

describe('UpdateStudentAnswerComponent', () => {
  let component: UpdateStudentAnswerComponent;
  let fixture: ComponentFixture<UpdateStudentAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStudentAnswerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateStudentAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
