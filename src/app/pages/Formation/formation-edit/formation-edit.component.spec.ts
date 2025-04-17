import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormationEditComponent } from './formation-edit.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormationService } from '../../../services/formation.service';
import { of } from 'rxjs';
import { Formation } from '../../../models/formation';

describe('FormationEditComponent', () => {
  let component: FormationEditComponent;
  let fixture: ComponentFixture<FormationEditComponent>;
  let mockFormationService: any;
  let mockRouter: any;

  const mockFormation: Formation = {
    id: 1,
    title: 'Test Formation',
    description: 'Test Description',
    price: 100,
    duration: '2 hours',
    image: 'test.jpg',
    label: 'Test Label',
    discount: '10%',
    featured: 'true',
    highestRated: 'false',
    ressources: [],
    quiz: {
      idQuiz: 1,
      title: 'Sample Quiz',
      description: 'A sample quiz',
      duration: 10,
      nbrquestions: 5,
      categorie: 'General'
    }
  };

  beforeEach(async () => {
    mockFormationService = jasmine.createSpyObj('FormationService', ['getFormationById', 'updateFormation']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormationEditComponent
      ],
      providers: [
        FormBuilder,
        { provide: FormationService, useValue: mockFormationService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    mockFormationService.getFormationById.and.returnValue(of(mockFormation));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load formation data on init', () => {
    expect(mockFormationService.getFormationById).toHaveBeenCalledWith(1);
    expect(component.editForm.get('title')?.value).toBe('Test Formation');
  });

  it('should handle image drop', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
      dataTransfer: {
        files: [mockFile]
      }
    } as unknown as DragEvent;

    component.onDrop(mockEvent);
    expect(component.isDragging).toBe(false);
  });

  it('should update formation on valid form submit', () => {
    const updatedFormation: Formation = {
      ...mockFormation,
      title: 'Updated Formation',
      price: 200
    };
    mockFormationService.updateFormation.and.returnValue(of(updatedFormation));

    component.editForm.patchValue({
      title: 'Updated Formation',
      price: 200
    });

    component.onSubmit();

    expect(mockFormationService.updateFormation).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/DisplayBack']);
  });

  it('should show error message on invalid form submit', () => {
    component.editForm.controls['title'].setErrors({ required: true });
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill in all required fields correctly.');
  });
});
