import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { FormationService } from '../../../services/formation.service';
import { Formation } from '../../../models/formation';
import { Router } from '@angular/router';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// Custom validator for symbol validation
function symbolValidator(pattern: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null; // Skip if empty
    return pattern.test(value) ? null : { pattern: true };
  };
}

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardHeaderComponent],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {
  addForm!: FormGroup;
  categories: Category[] = [];
  isDragging = false;
  imagePreview: SafeUrl | null = null;
  selectedFile: File | null = null;
  errorMessage = '';
  successMessage = '';
  loading = false;

  // Regex patterns for validation
  private readonly titlePattern = /^[a-zA-Z0-9\s]+$/;
  private readonly labelPattern = /^[a-zA-Z0-9\s]+$/;
  private readonly durationPattern = /^([0-9]+h)?([0-9]+m)?$/;
  private readonly urlPattern = /^(https?:\/\/)?([\da-z.\-]+)\.([a-z.]{2,6})([\/\w .\-_?=%&]*)*\/?$/i;
  private readonly descriptionPattern = /^[a-zA-Z0-9\s.,;:!?]+$/;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private categoryService: CategoryService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.addForm = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        symbolValidator(this.titlePattern) // Custom validator
      ]],
      label: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        symbolValidator(this.labelPattern)
      ]],
      duration: ['', [
        Validators.required,
        Validators.pattern(this.durationPattern)
      ]],
      price: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
        symbolValidator(this.descriptionPattern)
      ]],
      categoryName: ['', Validators.required],
      discount: [0, [
        Validators.min(0),
        Validators.max(100)
      ]],
      featured: [false],
      highestRated: [false]
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories. Please try again later.';
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  private handleFiles(files: FileList | null): void {
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, WEBP).';
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'The image file size must not exceed 5 MB.';
        this.selectedFile = null;
        this.imagePreview = null;
        return;
      }

      // Process valid image
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate form before proceeding
    if (!this.validateForm()) {
      return;
    }

    if (this.addForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      // Append all form values
      Object.keys(this.addForm.value).forEach(key => {
        const value = this.addForm.get(key)?.value;
        formData.append(key, value !== null && value !== undefined ? value.toString() : '');
      });

      this.formationService.addFormationWithImage(formData).subscribe({
        next: (response: Formation) => {
          this.successMessage = 'Course created successfully!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/DisplayBack']), 1500);
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.errorMessage = error.status === 400
            ? 'Invalid data submitted. Please check your entries.'
            : `Failed to create course: ${error.message || 'Unknown error'}`;
        }
      });
    } else {
      this.markFormGroupTouched(this.addForm);
      this.errorMessage = !this.selectedFile
        ? 'Please upload an image for the course.'
        : 'Please fill in all required fields correctly.';
    }
  }

  private validateForm(): boolean {
    const fieldsWithPatterns = ['title', 'label', 'duration', 'description'];
    let isValid = true;

    fieldsWithPatterns.forEach(field => {
      const control = this.addForm.get(field);
      if (control && control.value) {
        let pattern;
        switch (field) {
          case 'title': pattern = this.titlePattern; break;
          case 'label': pattern = this.labelPattern; break;
          case 'duration': pattern = this.durationPattern; break;
          case 'description': pattern = this.descriptionPattern; break;
        }

        if (pattern && !pattern.test(control.value)) {
          control.setErrors({ 'pattern': true });
          isValid = false;
        }
      }
    });

    return isValid;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.addForm.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) return '';

    const errors = control.errors;
    const fieldNames: { [key: string]: string } = {
      'title': 'Title',
      'label': 'Label',
      'duration': 'Duration',
      'price': 'Price',
      'description': 'Description',
      'categoryName': 'Category',
      'discount': 'Discount'
    };

    const fieldName = fieldNames[controlName] || controlName;

    if (errors['minlength']) return `${fieldName} must contain at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `${fieldName} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${fieldName} cannot exceed ${errors['max'].max}`;

    if (errors['pattern']) {
      switch (controlName) {
        case 'duration':
          return 'The duration must be in the format: 1h30m';
        case 'title':
        case 'label':
          return `${fieldName} contains unauthorized characters. Allowed characters: letters, numbers, and spaces`;
        case 'description':
          return `${fieldName} contains unauthorized characters. Allowed characters: letters, numbers, spaces, and punctuation (.,;:!?)`;
        default:
          return 'Invalid format';
      }
    }

    return 'Invalid input';
  }

  resetForm(): void {
    this.addForm.reset({
      title: '',
      label: '',
      duration: '',
      price: 0,
      description: '',
      categoryName: '',
      discount: 0,
      featured: false,
      highestRated: false
    });
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/DisplayBack']);
  }
}