import { Component, inject, OnInit } from '@angular/core';
import { FormationService } from '../../../services/formation.service';
import { FormsModule } from '@angular/forms';
import { Formation } from '../../../models/formation';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';

import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [FormsModule, CommonModule, DashboardHeaderComponent],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css'
})
export class AddComponent implements OnInit {
  formation: Formation = {
    id: 0,
    title: '',
    certificate: '',
    description: '',
    discount: '',
    duration: '',
    featured: '',
    highestRated: '',
    image: '',
    label: '',
    price: 0,
    progression: '',
    video: '',
    categoryName: '' // Ajoutez cette propriété pour stocker le nom de la catégorie
  };
  categories: Category[] = [];

  // Injection des services avec inject()
  private formationService = inject(FormationService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadCategories();
  }

  // Charge la liste des catégories
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }

  // Soumission du formulaire
  onSubmit() {
    if (!this.formation.categoryName) {
      alert('Please select a category.');
      return;
    }

    // Ajouter la formation
    this.formationService.addFormation(this.formation).subscribe({
      next: (response) => {
        console.log('Formation created:', response);

        // Vérifiez que categoryName est défini avant de l'utiliser
        if (this.formation.categoryName) {
          // Affecter la catégorie à la formation après l'avoir ajoutée
          this.formationService.affecterCategoryAFormation(response.id, this.formation.categoryName).subscribe({
            next: (updatedFormation) => {
              console.log('Category assigned to formation:', updatedFormation);
              alert('Formation created and category assigned successfully!');
              this.resetForm();
            },
            error: (err) => {
              console.error('Error assigning category:', err);
              alert('Formation created, but failed to assign category!');
            }
          });
        } else {
          alert('Formation created, but no category was selected!');
        }
      },
      error: (err) => {
        console.error('Error creating formation:', err);
        alert('Error creating formation!');
      }
    });
  }

  // Réinitialiser le formulaire
  resetForm(): void {
    this.formation = {
      id: 0,
      title: '',
      certificate: '',
      description: '',
      discount: '',
      duration: '',
      featured: '',
      highestRated: '',
      image: '',
      label: '',
      price: 0,
      progression: '',
      video: '',
      categoryName: '' // Réinitialisez categoryName
    };
  }

  // Retour à la page précédente
  goBack(): void {
    this.router.navigate(['/DisplayBack']);
  }
}