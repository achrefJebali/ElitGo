import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { FormationService } from '../../../services/formation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  userId: number | null = null; // Allow null for error checking
  formationId: number | null = null;
  hasPurchasedFormations: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private formationService: FormationService
  ) { }

  ngOnInit(): void {
    // Try to get from query params first, then fall back to sessionStorage
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] ? +params['userId'] : (sessionStorage.getItem('userId') ? +sessionStorage.getItem('userId')! : null);
      this.formationId = params['formationId'] ? +params['formationId'] : (sessionStorage.getItem('formationId') ? +sessionStorage.getItem('formationId')! : null);
      if (!this.userId || !this.formationId) {
        this.errorMessage = 'User ID or Formation ID is missing';
        return;
      }
      this.recordPurchaseAndCheckFormations();
    });
  }

  recordPurchaseAndCheckFormations() {
    if (this.userId && this.formationId) {
      const paymentReference = 'stripe_payment_' + Date.now(); // Example, replace with actual Stripe payment ID
      this.purchaseService.createPurchase(this.userId, this.formationId, paymentReference).subscribe({
        next: () => {
          this.successMessage = 'Purchase recorded successfully';
          // Clear sessionStorage after use
          sessionStorage.removeItem('userId');
          sessionStorage.removeItem('formationId');
          this.checkPurchasedFormations();
        },
        error: (error) => {
          this.errorMessage = 'Failed to record purchase';
        }
      });
    }
  }

  checkPurchasedFormations() {
    if (this.userId) {
      this.formationService.getPurchasedFormations(this.userId).subscribe({
        next: (formations) => {
          this.hasPurchasedFormations = formations.length > 0;
          if (this.hasPurchasedFormations) {
            this.router.navigate(['/purchased-formations'], { queryParams: { userId: this.userId } });
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load purchased formations';
        }
      });
    }
  }

  checkFormations() {
    if (this.userId) {
      this.router.navigate(['/formation-list'], { queryParams: { userId: this.userId } });
    }
  }
}