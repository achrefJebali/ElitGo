import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Formation } from '../../../models/formation';
import { FormationService } from '../../../services/formation.service';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-display-back',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent
  ],
  templateUrl: './display-back.component.html',
  styleUrls: ['./display-back.component.css']
})
export class DisplayBackComponent implements OnInit {
  formations: Formation[] = [];
  errorMessage: string = '';

  constructor(
    private formationService: FormationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.formationService.getFormations().subscribe({
      next: (data) => {
        this.formations = data;
      },
      error: (error) => {
        console.error('Error loading formations:', error);
        this.errorMessage = 'Failed to load formations';
      }
    });
  }

  navigateToEditFormation(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/formation-edit', id]);
  }

  deleteFormation(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this formation?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.formations = this.formations.filter(f => f.id !== id);
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
}
