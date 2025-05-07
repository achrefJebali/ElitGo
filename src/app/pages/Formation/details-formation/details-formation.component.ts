import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LayoutComponent } from '../../layout/layout.component';
import { Formation } from '../../../models/formation';
import { PaymentService } from '../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { Review } from '../../../models/review';
import { FormationService } from '../../../services/formation.service';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { catchError, map, Observable } from 'rxjs';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-details-formation',
  standalone: true,
  imports: [CommonModule, LayoutComponent, RouterModule],
  templateUrl: './details-formation.component.html',
  styleUrls: ['./details-formation.component.css']
})
export class DetailsFormationComponent implements OnInit {
  formation: Formation | undefined;
  reviews: Review[] = [];
  studentEmail: string = 'skanderlghmardi@gmail.com';
  userId: number = 1;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imageUrl: Observable<SafeUrl> | null = null;
  private readonly PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  averageRating: number = 0;
  totalReviews: number = 0;
  isWishlisted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private formationService: FormationService,
    private paymentService: PaymentService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchFormation(+id);
        this.fetchReviews(+id);
        this.fetchFormationImage(+id);
      } else {
        this.errorMessage = 'Formation ID is missing';
      }
    });
  }

  fetchFormation(id: number): void {
    this.formationService.getFormationById(id).subscribe({
      next: (data) => {
        this.formation = data;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load formation details';
      }
    });
  }

  fetchReviews(formationId: number): void {
    this.formationService.getReviewsByFormation(formationId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.calculateRatingStats(); // Calculate average rating and total reviews
      },
      error: (error) => {
        this.errorMessage = 'Failed to load reviews';
      }
    });
  }

  fetchFormationImage(formationId: number): void {
    this.imageUrl = this.formationService.getFormationImageById(formationId).pipe(
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.setAttribute('src', this.PLACEHOLDER_IMAGE);
  }

  calculateRatingStats(): void {
    if (this.reviews && this.reviews.length > 0) {
      this.totalReviews = this.reviews.length;
      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      this.averageRating = Number((totalRating / this.totalReviews).toFixed(1)); // Round to 1 decimal place
    } else {
      this.totalReviews = 0;
      this.averageRating = 0;
    }
  }

  // Helper to generate star array for display
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

  sendPurchaseEmail(studentEmail: string, studentName: string, formationName: string) {
    const templateParams = {
      to_email: studentEmail,
      to_name: studentName,
      formation_name: formationName
    };
    emailjs.send(
      'YOUR_SERVICE_ID',      // Replace with your EmailJS service ID
      'YOUR_TEMPLATE_ID',     // Replace with your EmailJS template ID
      templateParams,
      'YOUR_USER_ID'          // Replace with your EmailJS public key (user ID)
    ).then((response) => {
      this.successMessage = 'Confirmation email sent!';
    }, (error) => {
      this.errorMessage = 'Failed to send confirmation email.';
    });
  }

  buyFormation(): void {
    if (this.formation && this.studentEmail && this.userId) {
      sessionStorage.setItem('userId', this.userId.toString());
      sessionStorage.setItem('formationId', this.formation.id.toString());
      this.paymentService.initiatePayment(this.formation.id, this.studentEmail, this.userId).subscribe({
        next: (paymentUrl: string) => {
          this.sendPurchaseEmail(
            this.studentEmail,
            'Student', // Use a real student name if available
            this.formation?.title || 'Course'
          );
          window.location.href = paymentUrl;
        },
        error: (error) => {
          this.errorMessage = 'Failed to initiate payment';
        }
      });
    } else {
      this.errorMessage = 'Missing required information for payment';
    }
  }

  toggleWishlist() {
    this.isWishlisted = !this.isWishlisted;
    // Here you can call a service to persist wishlist status if needed
  }

  shareFormation() {
    if (this.formation) {
      const shareText = `Check out this formation: ${this.formation.title}`;
      if (navigator.share) {
        navigator.share({
          title: this.formation.title,
          text: shareText,
          url: window.location.href
        });
      } else {
        window.prompt('Copy this link to share:', window.location.href);
      }
    }
  }

  reportAbuse() {
    this.successMessage = 'Thank you for reporting. Our team will review this formation.';
    // You can add actual reporting logic here if needed
  }
}