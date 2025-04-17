import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Formation } from '../../../models/formation';
import { FormationService } from '../../../services/formation.service';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';
import { FormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-display-back',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    FormsModule
  ],
  templateUrl: './display-back.component.html',
  styleUrls: ['./display-back.component.css']
})
export class DisplayBackComponent implements OnInit {
  title: string = '';
  categoryName: string = '';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  label: string = '';
  formations: Formation[] = [];
  errorMessage: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 4;
  totalItems: number = 0;
  totalPages: number = 0;

  selectedFormation: Formation | null = null;
  selectedDiscount: number = 0;
  discountError: string = '';

  constructor(
    private formationService: FormationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getFormations(this.currentPage - 1, this.pageSize).subscribe({
      next: (response) => {
        this.formations = response.formations;
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.errorMessage = 'Failed to load formations';
      }
    });
  }

  search(): void {
    this.currentPage = 1; // Reset to the first page on search
    this.formationService.searchFormations(
      this.title,
      this.categoryName,
      this.minPrice,
      this.maxPrice,
      this.label,
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.formations = response.formations;
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      },
      error: (err) => {
        console.error('Error fetching formations:', err);
        this.errorMessage = 'Failed to search formations';
      }
    });
  }

  navigateToEditFormation(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/formation-edit', id]);
  }

  editFormation(formation: Formation) {
    this.navigateToEditFormation(formation.id, undefined as any as Event);
  }

  deleteFormation(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this formation?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.formations = this.formations.filter(f => f.id !== id);
          this.totalItems -= 1;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          if (this.formations.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadFormations();
          }
        },
        error: (error) => {
          console.error('Error deleting formation:', error);
          this.errorMessage = 'Failed to delete formation';
        }
      });
    }
  }

  navigateToAddFormation(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/formation-add']);
  }

  openDiscountModal(formation: Formation) {
    this.selectedFormation = formation;
    this.selectedDiscount = formation.discount || 0;
    ($('#discountModal') as any).modal('show');
  }

  closeDiscountModal() {
    this.discountError = '';
    this.selectedFormation = null;
    this.selectedDiscount = 0;
    ($('#discountModal') as any).modal('hide');
  }

  submitDiscount() {
    if (this.selectedDiscount > 90) {
      this.discountError = 'Discount cannot be more than 90%.';
      return;
    }
    if (!Number.isInteger(this.selectedDiscount)) {
      this.discountError = 'Discount must be a whole number.';
      return;
    }
    this.discountError = '';
    if (this.selectedFormation && this.selectedDiscount >= 0) {
      this.formationService.updateDiscount(this.selectedFormation.id, this.selectedDiscount)
        .subscribe((updated: Formation) => {
          if (this.selectedFormation) {
            Object.assign(this.selectedFormation as object, updated);
          }
          this.closeDiscountModal();
        });
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadFormations();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFormations();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFormations();
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  getShowingText(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${start}-${end} of ${this.totalItems} results`;
  }
}