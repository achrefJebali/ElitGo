import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';
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
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // --- Modern Pagination State & Methods ---
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  constructor(private categoryService: CategoryService) { }
  private router = inject(Router);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        this.successMessage = 'Categories loaded successfully';
      },
      error: (error) => {
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCategories();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  getShowingText(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.categories?.length || 0);
    return `Showing ${start} to ${end} of ${this.categories?.length || 0} categories`;
  }

  editCategory(category: Category): void {
    // Ajoutez ici la logique pour éditer la catégorie
  }

  deleteCategory(category: Category): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.successMessage = 'Category deleted successfully';
          this.categories = this.categories.filter(c => c.id !== category.id);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete category';
        }
      });
    }
  }

  navigateToAddCategory(): void {
    this.router.navigate(['/add-category']);
  }
}