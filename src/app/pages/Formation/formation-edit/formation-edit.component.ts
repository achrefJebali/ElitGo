import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Formation } from '../../../models/formation';
import { Category } from '../../../models/category';
import { FormationService } from '../../../services/formation.service';
import { CategoryService } from '../../../services/category.service';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, map, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-formation-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardHeaderComponent],
  templateUrl: './formation-edit.component.html',
  styleUrls: ['./formation-edit.component.css']
})
export class FormationEditComponent implements OnInit, OnDestroy {
  editForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  formationId!: number;
  loading = true;
  isDragging = false;
  imagePreview: SafeUrl | null = null;
  selectedFile: File | null = null;
  categories: Category[] = [];
  private blobUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.initForm();
    // Load categories first, then load formation
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // After categories are loaded, load the formation
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.formationId = +id;
          this.loadFormation();
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }

  private initForm(): void {
    function symbolValidator(pattern: RegExp) {
      return (control: import('@angular/forms').AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (!value) return null; // Skip if empty
        return pattern.test(value) ? null : { pattern: true };
      };
    }

    const titlePattern = /^[a-zA-Z0-9\s]+$/;
    const labelPattern = /^[a-zA-Z0-9\s]+$/;
    const durationPattern = /^([0-9]+h)?([0-9]+m)?$/;
    const descriptionPattern = /^[a-zA-Z0-9\s.,;:!?]+$/;

    this.editForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required, Validators.minLength(3), symbolValidator(titlePattern)]],
      description: ['', [Validators.required, symbolValidator(descriptionPattern)]],
      price: [0, [Validators.required, Validators.min(0)]],
      duration: ['', [Validators.required, symbolValidator(durationPattern)]],
      label: ['', [Validators.required, symbolValidator(labelPattern)]],
      discount: [''],
      featured: [false],
      highestRated: [false],
      categoryName: ['', Validators.required]
    });
  }

  private loadFormation(): void {
    this.formationService.getFormationById(this.formationId).subscribe({
      next: (formation) => {
        const categoryName = formation.category ? formation.category.name : '';
        // Update form values
        this.editForm.patchValue({
          id: formation.id,
          title: formation.title,
          description: formation.description,
          price: formation.price,
          duration: formation.duration,
          label: formation.label,
          discount: formation.discount,
          featured: formation.featured,
          highestRated: formation.highestRated,
          categoryName: categoryName
        });

        // Load image and complete loading
        this.loadFormationImage(this.formationId);
        this.loading = false;
        this.preSelectCategory(); // Pre-select after patching
      },
      error: (error) => {
        this.errorMessage = 'Failed to load formation details';
        this.loading = false;
      }
    });
  }

  private preSelectCategory(): void {
    const categoryName = this.editForm.get('categoryName')?.value;

    if (categoryName) {
      const category = this.categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
      if (category) {
        this.editForm.get('categoryName')?.setValue(category.name, { emitEvent: false });
      } else {
        const possibleMatches = this.categories.filter(cat => cat.name.toLowerCase().includes(categoryName.toLowerCase()));
        this.editForm.get('categoryName')?.setValue('', { emitEvent: false }); // Reset if not found
      }
    }
  }

  private loadFormationImage(formationId: number): void {
    this.formationService.getFormationImageById(formationId).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        this.blobUrl = url;
        return this.sanitizer.bypassSecurityTrustUrl(url);
      }),
      catchError(error => {
        return new Observable<SafeUrl>(subscriber => {
          subscriber.error(error);
        });
      })
    ).subscribe({
      next: (safeUrl: SafeUrl) => {
        this.imagePreview = safeUrl;
      },
      error: (error) => {
        this.imagePreview = null;
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

  getErrorMessage(controlName: string): string {
    const control = this.editForm.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) return '';
    const errors = control.errors;
    const fieldNames: { [key: string]: string } = {
      'title': 'Titre',
      'label': 'Label',
      'duration': 'Durée',
      'price': 'Prix',
      'description': 'Description',
      'categoryName': 'Catégorie',
      'discount': 'Remise'
    };
    const fieldName = fieldNames[controlName] || controlName;
    if (errors['minlength']) return `${fieldName} doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `${fieldName} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `${fieldName} doit être au moins ${errors['min'].min}`;
    if (errors['max']) return `${fieldName} ne peut pas dépasser ${errors['max'].max}`;
    if (errors['required']) return `${fieldName} est requis.`;
    if (errors['pattern']) {
      switch (controlName) {
        case 'duration':
          return 'La durée doit être au format : 1h30m';
        case 'title':
        case 'label':
          return `${fieldName} contient des caractères non autorisés. Lettres, chiffres et espaces seulement.`;
        case 'description':
          return `${fieldName} contient des caractères non autorisés. Lettres, chiffres, espaces, et ponctuation (.,;:!?) autorisés.`;
        default:
          return 'Format invalide';
      }
    }
    return 'Entrée invalide';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.editForm.valid) {
      const formData = new FormData();
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      formData.append('title', this.editForm.get('title')?.value);
      formData.append('description', this.editForm.get('description')?.value);
      formData.append('price', this.editForm.get('price')?.value.toString());
      formData.append('duration', this.editForm.get('duration')?.value);
      formData.append('label', this.editForm.get('label')?.value);
      formData.append('discount', this.editForm.get('discount')?.value?.toString() || '');
      formData.append('featured', this.editForm.get('featured')?.value.toString());
      formData.append('highestRated', this.editForm.get('highestRated')?.value.toString());
      formData.append('categoryName', this.editForm.get('categoryName')?.value);

      this.formationService.updateFormationWithImage(this.formationId, formData).subscribe({
        next: (response: Formation) => {
          this.successMessage = 'Formation updated successfully!';
          setTimeout(() => this.router.navigate(['/DisplayBack']), 1500);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.status === 400
            ? 'Invalid data submitted. Please check your inputs.'
            : `Failed to update formation: ${error.message}`;
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.editForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.router.navigate(['/DisplayBack']);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  }
}