import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '../../../services/formation.service';
import { Formation } from '../../../models/formation';
import { Router } from '@angular/router';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
        Validators.maxLength(100)
      ]],
      label: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      duration: ['', [
        Validators.required,
        Validators.pattern(/^([0-9]+h)?([0-9]+m)?$/)
      ]],
      price: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(10000)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000)
      ]],
      categoryName: ['', Validators.required],
      certificate: [''],
      video: ['', [
        Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/)
      ]],
      discount: [0, [
        Validators.min(0),
        Validators.max(100)
      ]],
      featured: [false],
      highestRated: [false],
      progression: [0, [
        Validators.min(0),
        Validators.max(100)
      ]]
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
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
    this.handleFiles(event.dataTransfer?.files);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFiles(input.files);
  }

  private handleFiles(files: FileList | null | undefined): void {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        this.errorMessage = '';
      } else {
        this.errorMessage = 'Please select an image file (e.g., .jpg, .png).';
        this.selectedFile = null;
        this.imagePreview = null;
      }
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.addForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      
      // Append all form values
      Object.keys(this.addForm.value).forEach(key => {
        const value = this.addForm.get(key)?.value;
        formData.append(key, value !== null && value !== undefined ? value.toString() : '');
      });

      console.log('FormData being sent:', [...formData.entries()]);
      
      this.formationService.addFormationWithImage(formData).subscribe({
        next: (response: Formation) => {
          this.successMessage = 'Course created successfully!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/DisplayBack']), 1500);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating formation:', error);
          this.loading = false;
          this.errorMessage = error.status === 400
            ? 'Invalid data submitted. Please check your inputs.'
            : `Failed to create course: ${error.message}`;
        }
      });
    } else {
      this.markFormGroupTouched(this.addForm);
      this.errorMessage = !this.selectedFile 
        ? 'Please upload an image for the course.'
        : 'Please fill all required fields correctly.';
    }
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
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    if (errors['required']) return `${controlName} is required`;
    if (errors['minlength']) return `${controlName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${controlName} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `${controlName} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${controlName} cannot exceed ${errors['max'].max}`;
    if (errors['pattern']) {
      switch(controlName) {
        case 'duration':
          return 'Duration must be in format: 1h30m';
        case 'video':
          return 'Please enter a valid URL';
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
      certificate: '', 
      video: '', 
      discount: 0,
      featured: false, 
      highestRated: false, 
      progression: 0
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