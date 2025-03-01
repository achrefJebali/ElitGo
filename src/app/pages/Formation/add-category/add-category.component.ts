import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [FormsModule, CommonModule, DashboardHeaderComponent],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent {
  category: Category = {
    id: 0,
    name: '',
    description: '',
    picture: ''
  };

  // Injection des services avec inject()
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  // Soumission du formulaire
  onSubmit() {
    if (!this.category.name || !this.category.description) {
      alert('Please fill in all required fields.');
      return;
    }

    // Ajouter la catégorie
    this.categoryService.addCategory(this.category).subscribe({
      next: (response) => {
        console.log('Category added:', response);
        alert('Category added successfully!');
        this.resetForm(); // Réinitialiser le formulaire
        this.router.navigate(['/categories']); // Rediriger vers la liste des catégories
      },
      error: (err) => {
        console.error('Error adding category:', err);
        alert('Error adding category!');
      }
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.category = {
      id: 0,
      name: '',
      description: '',
      picture: ''
    };
  }

  // Retour à la page précédente
  goBack(): void {
    this.router.navigate(['/category-list']);
  }
}