import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Formation } from 'app/models/formation';
import { FooterComponent } from 'app/pages/footer/footer.component';
import { LayoutComponent } from 'app/pages/layout/layout.component';
import { FormationService } from 'app/services/formation.service';
import { ProgressComponent } from '../progress/progress.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from 'app/services/review.service';
import { Review } from 'app/models/review';

@Component({
  selector: 'app-purchased-formations',
  standalone: true,
  imports: [
    LayoutComponent,
    FooterComponent,
    ProgressComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './purchased-formations.component.html',
  styleUrls: ['./purchased-formations.component.css']
})
export class PurchasedFormationsComponent implements OnInit {
  title: string = '';
  categoryName: string = '';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  filteredFormations: Formation[] = [];
  label: string = '';
  userId: number = 1; // Hardcoded for testing; replace with dynamic value or query param
  purchasedFormations: Formation[] = [];
  errorMessage: string = '';
  searchQuery: string = '';
  isLoading: boolean = false;

  imageUrls: { [key: number]: Observable<SafeUrl> } = {};
  private readonly PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  showReviewModal = false;
  review: any = { rating: 0, comment: '' };
  currentFormationId: number | null = null;
  hoveredStar = 0;

  // --- Modern Pagination State & Methods ---
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  constructor(
    private formationService: FormationService,
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // Extract userId from query params or use default
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] ? +params['userId'] : 1;
    });
  }

  ngOnInit(): void {
    this.loadPurchasedFormations();
  }

  loadPurchasedFormations(): void {
    this.isLoading = true;
    this.formationService.getPurchasedFormations(this.userId).subscribe({
      next: (formations) => {
        this.purchasedFormations = formations;
        this.filteredFormations = [...this.purchasedFormations];
        this.totalPages = Math.ceil(this.purchasedFormations.length / this.pageSize);

        // Fetch images for each formation
        this.purchasedFormations.forEach(formation => {
          if (formation.id) {
            this.imageUrls[formation.id] = this.getFormationImageUrl(formation.id);
          }
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load purchased formations';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredFormations = [...this.purchasedFormations];
      return;
    }

    this.filteredFormations = this.purchasedFormations.filter(formation =>
      formation.title?.toLowerCase().includes(query)
    );
  }

  openReviewModal(formation: any): void {
    this.currentFormationId = formation.id;
    this.review = { rating: 0, comment: '' };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.currentFormationId = null;
  }

  setRating(star: number): void {
    this.review.rating = star;
  }

  submitReview() {
    if (this.review.rating === 0 || !this.review.comment.trim()) {
      alert('Please provide a rating and a comment.');
      return;
    }
    if (this.currentFormationId == null) {
      alert('No formation selected for review.');
      return;
    }
    this.reviewService.addReview(this.userId, this.currentFormationId, {
      rating: this.review.rating,
      comment: this.review.comment
    }).subscribe({
      next: () => {
        this.closeReviewModal();
        // Optionally show a success message or refresh reviews
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to submit review.');
      }
    });
  }

  viewFormation(formationId: number): void {
    this.router.navigate([`/startformation`, formationId]);
  }

  checkFormations(): void {
    this.router.navigate(['/formation-list'], { queryParams: { userId: this.userId } });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('Image failed to load:', img.src);
    img.setAttribute('src', this.PLACEHOLDER_IMAGE);
  }

  getFormationImageUrl(formationId: number): Observable<SafeUrl> {
    return this.formationService.getFormationImageById(formationId).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(url);
      }),
      catchError(error => {
        return new Observable<SafeUrl>(subscriber => {
          subscriber.next(this.sanitizer.bypassSecurityTrustUrl(this.PLACEHOLDER_IMAGE));
          subscriber.complete();
        });
      })
    );
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPurchasedFormations();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPurchasedFormations();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPurchasedFormations();
    }
  }

  getShowingText(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.purchasedFormations?.length || 0);
    return `Showing ${start} to ${end} of ${this.purchasedFormations?.length || 0} formations`;
  }
}