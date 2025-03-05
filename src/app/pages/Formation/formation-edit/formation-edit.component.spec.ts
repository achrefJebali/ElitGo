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
  let mockFormationService: jest.Mocked<FormationService>;
  let mockRouter: jest.Mocked<Router>;

  const mockFormation: Formation = {
    id: 1,
    title: 'Test Formation',
    description: 'Test Description',
    price: 100,
    duration: '2 hours',
    image: 'test.jpg',
    label: 'Test Label',
    certificate: 'Test Certificate',
    video: 'test.mp4',
    discount: '10%',
    featured: 'true',
    highestRated: 'false',
    progression: '50%'
  };

  beforeEach(async () => {
    mockFormationService = {
      getFormationById: jest.fn(),
      updateFormation: jest.fn()
    } as unknown as jest.Mocked<FormationService>;

    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

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

    mockFormationService.getFormationById.mockReturnValue(of(mockFormation));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });

  test('should load formation data on init', () => {
    expect(mockFormationService.getFormationById).toHaveBeenCalledWith(1);
    expect(component.editForm.get('title')?.value).toBe('Test Formation');
  });

  test('should handle image drop', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: {
        files: [mockFile]
      }
    } as unknown as DragEvent;

    component.onDrop(mockEvent);
    expect(component.isDragging).toBe(false);
  });

  test('should update formation on valid form submit', () => {
    const updatedFormation: Formation = {
      ...mockFormation,
      title: 'Updated Formation',
      price: 200
    };
    mockFormationService.updateFormation.mockReturnValue(of(updatedFormation));
    
    component.editForm.patchValue({
      title: 'Updated Formation',
      price: 200
    });

    component.onSubmit();

    expect(mockFormationService.updateFormation).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/DisplayBack']);
  });

  test('should show error message on invalid form submit', () => {
    component.editForm.controls['title'].setErrors({ required: true });
    component.onSubmit();
    expect(component.errorMessage).toBe('Please fill in all required fields correctly.');
  });
});
