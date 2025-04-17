import { Component, OnInit } from '@angular/core';
import { Formation } from '../../../models/formation';
import { FormationService } from '../../../services/formation.service';
import { PaymentService } from '../../../services/payment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../layout/layout.component';
import { FooterComponent } from '../../footer/footer.component';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Review } from 'app/models/review';

@Component({
  selector: 'app-formation-display',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    FooterComponent,
    FormsModule
  ],
  templateUrl: './formation-display.component.html',
  styleUrls: ['./formation-display.component.css']
})
export class FormationDisplayComponent implements OnInit {
  searchQuery: string = '';
  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  imageUrls: { [key: number]: Observable<SafeUrl> } = {};
  private readonly PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Rating stats for each formation
  ratingStats: { [key: number]: { averageRating: number; totalReviews: number } } = {};

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private formationService: FormationService,
    private paymentService: PaymentService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.formationService.getFormations(this.currentPage - 1, this.pageSize).subscribe({
      next: (response) => {
        this.formations = response.formations;
        this.filteredFormations = [...this.formations];
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.formations.forEach(formation => {
          if (formation.id) {
            // Load image
            if (formation.image) {
              this.imageUrls[formation.id] = this.getFormationImageUrl(formation.id);
            }
            // Load rating stats
            this.loadRatingStats(formation.id);
          }
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.errorMessage = 'Failed to load formations. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // Dynamic search by title with pagination
  onSearch(): void {
    this.currentPage = 1; // Reset to the first page on search
    const query = this.searchQuery.toLowerCase().trim();
    this.formationService.searchFormations(
      query,
      '', // categoryName (not used in this case)
      undefined, // minPrice
      undefined, // maxPrice
      '', // label
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.formations = response.formations;
        this.filteredFormations = [...this.formations];
        this.totalItems = response.totalItems;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.formations.forEach(formation => {
          if (formation.id) {
            // Load image
            if (formation.image) {
              this.imageUrls[formation.id] = this.getFormationImageUrl(formation.id);
            }
            // Load rating stats
            this.loadRatingStats(formation.id);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching formations:', err);
        this.errorMessage = 'Failed to search formations';
      }
    });
  }

  loadRatingStats(formationId: number): void {
    this.formationService.getReviewsByFormation(formationId).subscribe({
      next: (reviews) => {
        const totalReviews = reviews.length;
        let averageRating = 0;
        if (totalReviews > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          averageRating = Number((totalRating / totalReviews).toFixed(1));
        }
        this.ratingStats[formationId] = { averageRating, totalReviews };
      },
      error: (error) => {
        console.error(`Error fetching reviews for formation ID ${formationId}:`, error);
        this.ratingStats[formationId] = { averageRating: 0, totalReviews: 0 };
      }
    });
  }

  getAverageRating(formationId: number): number {
    return this.ratingStats[formationId]?.averageRating || 0;
  }

  getTotalReviews(formationId: number): number {
    return this.ratingStats[formationId]?.totalReviews || 0;
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = Array(5).fill(0).map((_, index) => {
      if (index < fullStars) return 1; // Full star
      if (index === fullStars && hasHalfStar) return 0.5; // Half star
      return 0; // Empty star
    });
    return stars;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('Image failed to load:', img.src);
    img.setAttribute('src', this.PLACEHOLDER_IMAGE);
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/formations', id]);
  }

  getFormationImageUrl(formationId: number): Observable<SafeUrl> {
    return this.formationService.getFormationImageById(formationId).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        console.log(`Generated object URL for formation ID ${formationId}: ${url}`);
        return this.sanitizer.bypassSecurityTrustUrl(url);
      }),
      catchError(error => {
        console.error(`Failed to load image for formation ID ${formationId}:`, error);
        return new Observable<SafeUrl>(subscriber => {
          subscriber.next(this.sanitizer.bypassSecurityTrustUrl(this.PLACEHOLDER_IMAGE));
          subscriber.complete();
        });
      })
    );
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