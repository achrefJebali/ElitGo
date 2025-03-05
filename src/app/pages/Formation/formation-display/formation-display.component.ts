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

@Component({
  selector: 'app-formation-display',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    FooterComponent
  ],
  templateUrl: './formation-display.component.html',
  styleUrls: ['./formation-display.component.css']
})
export class FormationDisplayComponent implements OnInit {
  formations: Formation[] = [];
  imageUrls: { [key: number]: Observable<SafeUrl> } = {};
  private readonly PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  constructor(
    private formationService: FormationService,
    private paymentService: PaymentService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations() {
    this.formationService.getFormations().subscribe({
      next: (data) => {
        console.log('Formations data:', data);
        this.formations = data;
        this.formations.forEach(formation => {
          if (formation.id && formation.image) {
            this.imageUrls[formation.id] = this.getFormationImageUrl(formation.id); // Use formation ID
          }
        });
      },
      error: (error) => {
        console.error('Error loading formations:', error);
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.log('Image failed to load:', img.src);
    img.setAttribute('src', this.PLACEHOLDER_IMAGE);
  }

  navigateToDetails(id: number) {
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
}