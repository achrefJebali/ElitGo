import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from 'app/services/category.service';
import { Category } from 'app/models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardHeaderComponent],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }
  private router = inject(Router);

  ngOnInit(): void {
    this.loadCategories();
  }

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

  editCategory(category: Category): void {
    console.log('Edit category:', category);
    // Ajoutez ici la logique pour éditer la catégorie
  }

  deleteCategory(category: Category): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          console.log('Category deleted:', category);
          this.categories = this.categories.filter(c => c.id !== category.id);
        },
        error: (error) => {
          console.error('Failed to delete category:', error);
        }
      });
    }
  }
  navigateToAddCategory(): void {
    this.router.navigate(['/add-category']);
  }
}