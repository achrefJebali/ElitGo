import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Formation } from '../../../models/formation';
import { FormationService } from '../../../services/formation.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-display-back',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardHeaderComponent],
  templateUrl: './display-back.component.html',
  styleUrls: ['./display-back.component.css']
})
export class DisplayBackComponent implements OnInit {
  formations: Formation[] = [];
  errorMessage: string = '';

  editForm!: FormGroup;
  modalRef!: NgbModalRef;
  @ViewChild('editModal', { static: true }) editModal!: TemplateRef<any>;

  // Injection des services
  private formationService = inject(FormationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    this.loadFormations();
    this.initEditForm();
  }

  initEditForm(): void {
    this.editForm = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      certificate: [''],
      description: [''],
      discount: [''],
      duration: [''],
      featured: [''],
      highestRated: [''],
      image: [''],
      label: [''],
      price: [0, Validators.required],
      progression: [''],
      video: ['']
    });
  }

  loadFormations(): void {
    this.formationService.getFormations().subscribe({
      next: (data: Formation[]) => {
        this.formations = data;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load formations. Please try again later.';
        console.error(error);
      }
    });
  }

  deleteFormation(id: number): void {
    if (confirm('Are you sure you want to delete this formation?')) {
      this.formationService.deleteFormation(id).subscribe({
        next: () => {
          this.formations = this.formations.filter(formation => formation.id !== id);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete formation. Please try again later.';
          console.error(error);
        }
      });
    }
  }

  navigateToEditFormation(id: number): void {
    // Charge les données de la formation et ouvre la modal
    this.formationService.getFormationById(id).subscribe({
      next: (formation: Formation) => {
        this.editForm.patchValue(formation);
        this.modalRef = this.modalService.open(this.editModal, {
          size: 'lg', ariaLabelledBy: 'editFormationModalLabel'
        });
      },
      error: (error) => {
        console.error('Failed to load formation:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.formationService.updateFormation(this.editForm.value).subscribe({
        next: (updatedFormation: Formation) => {
          // Met à jour la formation dans la liste locale
          const index = this.formations.findIndex(f => f.id === updatedFormation.id);
          if (index !== -1) {
            this.formations[index] = updatedFormation;
          }
          this.modalRef.close();
        },
        error: (error) => {
          console.error('Failed to update formation:', error);
        }
      });
    }
  }

  navigateToAddFormation(): void {
    this.router.navigate(['/formation-add']);
  }
}
