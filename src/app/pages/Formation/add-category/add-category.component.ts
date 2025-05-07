import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';

// Custom validator for symbol validation (from add.component.ts)
function symbolValidator(pattern: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null; // Skip if empty
    return pattern.test(value) ? null : { pattern: true };
  };
}

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, DashboardHeaderComponent],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent {
  addCategoryForm = inject(FormBuilder).group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      symbolValidator(/^[a-zA-Z0-9\s]+$/)
    ]],
    description: ['', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000),
      symbolValidator(/^[a-zA-Z0-9\s.,;:!?]+$/)
    ]],
    picture: ['']
  });

  errorMessage = '';
  successMessage = '';

  private categoryService = inject(CategoryService);
  private router = inject(Router);

  onSubmit() {
    if (this.addCategoryForm.invalid) {
      this.addCategoryForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }
    const category: Category = {
      id: 0,
      name: this.addCategoryForm.value.name ?? '',
      description: this.addCategoryForm.value.description ?? ''
    };
    this.categoryService.addCategory(category).subscribe({
      next: (response) => {
        this.successMessage = 'Catégorie ajoutée avec succès!';
        this.resetForm();
        setTimeout(() => this.router.navigate(['/category-list']), 1500);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l\'ajout de la catégorie!';
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.addCategoryForm.get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) return '';
    const errors = control.errors;
    const fieldNames: { [key: string]: string } = {
      'name': 'Nom',
      'description': 'Description'
    };
    const fieldName = fieldNames[controlName] || controlName;
    if (errors['minlength']) return `${fieldName} doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `${fieldName} ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
    if (errors['required']) return `${fieldName} est requis.`;
    if (errors['pattern']) {
      switch (controlName) {
        case 'name':
          return `${fieldName} contient des caractères non autorisés. Lettres, chiffres et espaces seulement.`;
        case 'description':
          return `${fieldName} contient des caractères non autorisés. Lettres, chiffres, espaces, et ponctuation (.,;:!?) autorisés.`;
        default:
          return 'Format invalide';
      }
    }
    return 'Entrée invalide';
  }

  resetForm(): void {
    this.addCategoryForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack(): void {
    this.router.navigate(['/category-list']);
  }
}