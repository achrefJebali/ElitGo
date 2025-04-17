import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ressource } from '../../../models/ressource';
import { RessourceService } from '../../../services/ressource.service';
import { DashboardHeaderComponent } from 'app/pages/dashboard/dashboard-header/dashboard-header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Formation } from 'app/models/formation';
import { FormationService } from 'app/services/formation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-display-ressource',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './display-ressource.component.html',
  styleUrls: ['./display-ressource.component.css']
})
export class DisplayRessourceComponent implements OnInit {
  ressources: Ressource[] = [];
  formations: Formation[] = [];
  newRessource: Partial<Ressource> = {};
  showAddModal = false;
  editRessourceObj: Partial<Ressource> = {};
  showEditModal = false;
  selectedFile: File | null = null;
  editSelectedFile: File | null = null;
  addForm: FormGroup;
  editForm: FormGroup;
  errorMessage: string = '';

  // Modern Pagination State & Methods
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  // Validation patterns (same as add.component.ts)
  private readonly titlePattern = /^[a-zA-Z0-9\s]+$/;
  private readonly descriptionPattern = /^[a-zA-Z0-9\s.,;:!?]+$/;

  constructor(
    private ressourceService: RessourceService,
    private formationService: FormationService,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.patternValidator(this.titlePattern)]],
      type: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.patternValidator(this.descriptionPattern)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000), this.patternValidator(this.descriptionPattern)]],
      formationId: ['', Validators.required],
      file: [null, Validators.required]
    });
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), this.patternValidator(this.titlePattern)]],
      type: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.patternValidator(this.descriptionPattern)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000), this.patternValidator(this.descriptionPattern)]],
      formationId: ['', Validators.required],
      file: [null]
    });
  }

  ngOnInit(): void {
    this.formationService.getAllFormations().subscribe(data => {
      this.formations = data;
      this.loadRessources();
    });
  }

  loadRessources() {
    this.ressourceService.getAllRessources().subscribe((data) => {
      this.ressources = data;
      this.totalPages = Math.ceil(this.ressources.length / this.pageSize);
    });
  }

  openAddModal() {
    this.newRessource = {};
    this.showAddModal = true;
    const modal = document.getElementById('addRessourceModal');
    if (modal) {
      (window as any).$(modal).modal('show');
    }
  }

  closeAddModal() {
    this.showAddModal = false;
    this.addForm.reset();
    this.selectedFile = null;
    this.errorMessage = '';
    const modal = document.getElementById('addRessourceModal');
    if (modal) {
      (window as any).$(modal).modal('hide');
    }
  }

  onFileSelected(event: Event, mode: 'add' | 'edit') {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (mode === 'add') {
      this.selectedFile = file;
      this.addForm.patchValue({ file });
      this.addForm.get('file')?.updateValueAndValidity();
    } else {
      this.editSelectedFile = file;
      this.editForm.patchValue({ file });
      this.editForm.get('file')?.updateValueAndValidity();
    }
  }

  // Custom validator for pattern
  patternValidator(pattern: RegExp) {
    return (control: any) => {
      if (!control.value) return null;
      return pattern.test(control.value) ? null : { pattern: true };
    };
  }

  getErrorMessage(form: 'add' | 'edit', controlName: string): string {
    const control = (form === 'add' ? this.addForm : this.editForm).get(controlName);
    if (!control || !control.errors || !(control.dirty || control.touched)) return '';
    const errors = control.errors;
    const fieldNames: { [key: string]: string } = {
      title: 'Title',
      type: 'Type',
      description: 'Description',
      formationId: 'Formation'
    };
    const fieldName = fieldNames[controlName] || controlName;
    if (errors['required']) return `${fieldName} is required.`;
    if (errors['minlength']) return `${fieldName} must contain at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['maxlength']) return `${fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
    if (errors['pattern']) {
      switch (controlName) {
        case 'title':
          return `${fieldName} contains unauthorized characters. Allowed: letters, numbers, spaces.`;
        case 'type':
        case 'description':
          return `${fieldName} contains unauthorized characters. Allowed: letters, numbers, spaces, punctuation (.,;:!?)`;
        default:
          return 'Invalid format.';
      }
    }
    return 'Invalid input';
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  uploadVideoAndSaveRessource(mode: 'add' | 'edit') {
    const form = mode === 'add' ? this.addForm : this.editForm;
    if (form.invalid) {
      this.markFormGroupTouched(form);
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    const file = mode === 'add' ? this.selectedFile : this.editSelectedFile;
    if (!file) {
      this.errorMessage = 'Please select a video file.';
      return;
    }
    const formData = new FormData();
    formData.append('formationId', form.value.formationId);
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('type', form.value.type);
    formData.append('file', file);
    // Debug: log FormData contents
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    this.ressourceService.uploadVideo(formData).subscribe({
      next: (uploaded) => {
        this.loadRessources();
        if (mode === 'add') this.selectedFile = null;
        else this.editSelectedFile = null;
        this.showAddModal = false;
        this.showEditModal = false;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Video upload failed.';
      }
    });
  }

  openEditModal(ressource: Ressource) {
    this.editRessourceObj = { ...ressource };
    // Ensure formationId is a number for select binding
    if (this.editRessourceObj.formationId) {
      this.editRessourceObj.formationId = Number(this.editRessourceObj.formationId);
    }
    this.editForm.patchValue(this.editRessourceObj);
    this.showEditModal = true;
    const modal = document.getElementById('editRessourceModal');
    if (modal) {
      (window as any).$(modal).modal('show');
    }
  }

  closeEditModal() {
    this.showEditModal = false;
    const modal = document.getElementById('editRessourceModal');
    if (modal) {
      (window as any).$(modal).modal('hide');
    }
  }

  updateRessource() {
    if (!this.editRessourceObj.id) return;
    this.ressourceService.updateRessource(this.editRessourceObj).subscribe(() => {
      this.loadRessources();
      this.closeEditModal();
    });
  }

  updateVideoRessource() {
    const form = this.editForm;
    if (form.invalid) {
      this.markFormGroupTouched(form);
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    const formData = new FormData();
    formData.append('formationId', form.value.formationId);
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('type', form.value.type);
    if (this.editSelectedFile) {
      formData.append('file', this.editSelectedFile);
    }
    this.ressourceService.updateVideo(Number(this.editRessourceObj.id), formData).subscribe({
      next: (uploaded) => {
        this.loadRessources();
        this.editSelectedFile = null;
        this.showEditModal = false;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Video update failed.';
      }
    });
  }

  editRessource(ressource: Ressource) {
    this.openEditModal(ressource);
  }

  deleteRessource(id: number) {
    if (confirm('Are you sure you want to delete this ressource?')) {
      this.ressourceService.deleteRessource(id).subscribe(() => {
        this.loadRessources();
      });
    }
  }

  getPageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRessources();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRessources();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRessources();
    }
  }

  getShowingText(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.ressources?.length || 0);
    return `Showing ${start} to ${end} of ${this.ressources?.length || 0} resources`;
  }
}
