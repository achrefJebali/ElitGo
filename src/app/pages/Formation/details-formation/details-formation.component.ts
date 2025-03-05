import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LayoutComponent } from 'app/pages/layout/layout.component';
import { Formation } from 'app/models/formation';
import { PaymentService } from 'app/services/payment.service';
import { CommonModule } from '@angular/common';
import { FormationService } from 'app/services/formation.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-details-formation',
  standalone: true,
  imports: [CommonModule, LayoutComponent, RouterModule],
  templateUrl: './details-formation.component.html',
  styleUrls: ['./details-formation.component.css']
})
export class DetailsFormationComponent implements OnInit {
  formation: Formation | undefined;
  studentEmail: string = 'houssem@gmail.com'; // Replace with logged-in user's email

  constructor(
    private route: ActivatedRoute,
    private formationService: FormationService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchFormation(+id);
      } else {
        console.error('Formation ID is missing from the route');
      }
    });
  }

  fetchFormation(id: number): void {
    console.log('Fetching formation with ID:', id);
    this.formationService.getFormationById(id).subscribe({
      next: (data) => {
        console.log('Formation data received:', data);
        this.formation = data;
      },
      error: (error) => {
        console.error('Error fetching formation:', error);
      }
    });
  }

  buyFormation(): void {
    if (this.formation && this.studentEmail) {
      this.paymentService.initiatePayment(this.formation.id, this.studentEmail).subscribe({
        next: (paymentUrl: string) => {
          window.location.href = paymentUrl; // Redirect to Stripe Checkout
        },
        error: (error) => {
          console.error('Payment initiation failed:', error);
        }
      });
    } else {
      console.error('Formation or student email is missing');
    }
  }
}