import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { Announcement } from '../../models/announcement';
import { AnnouncementService } from '../../service/annoncement.service';

@Component({
  selector: 'app-annoncement',
  standalone: true,
  templateUrl: './annoncement.component.html',
  styleUrls: ['./annoncement.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    LayoutComponent,
    FooterComponent
  ]
})
export class AnnoncementComponent implements OnInit {
  announcementForm: FormGroup;
  announcements: Announcement[] = [];
  editMode = false;
  currentAnnouncementId: number | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService
  ) {
    this.announcementForm = this.fb.group({
      posttitle: ['', Validators.required],
      postslug: ['', Validators.required],
      postdesc: ['', Validators.required],
      creatdate: [new Date().toISOString().slice(0, 16)]
    });
  }

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  get f() {
    return this.announcementForm.controls;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitForm(): void {
    this.submitted = true;
    if (this.announcementForm.invalid) return;

    const formData = new FormData();
    formData.append('posttitle', this.announcementForm.value.posttitle);
    formData.append('postslug', this.announcementForm.value.postslug);
    formData.append('postdesc', this.announcementForm.value.postdesc);
    const rawDate = new Date(this.announcementForm.value.creatdate);
    formData.append('creatdate', formatDate(rawDate, 'yyyy-MM-dd HH:mm:ss', 'en-US'));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile); // 'file' au lieu de 'postimage'
    }

    const operation$ = this.editMode && this.currentAnnouncementId ?
      this.announcementService.updateAnnouncement(this.currentAnnouncementId, formData) :
      this.announcementService.addAnnouncement(formData);

    operation$.subscribe({
      next: () => {
        this.resetForm();
        this.loadAnnouncements();
        alert(`Opération ${this.editMode ? 'de modification' : 'd\'ajout'} réussie`);
      },
      error: (err) => {
        console.error('Operation failed:', err);
        alert(`Échec ${this.editMode ? 'de la mise à jour' : 'de la création'}`);
      }
    });
  }

  loadAnnouncements(): void {
    this.announcementService.getAnnouncements().subscribe({
      next: (announcements) => this.announcements = announcements,
      error: (err) => console.error('Erreur de chargement:', err)
    });
  }

  editAnnouncement(announcement: Announcement): void {
    this.editMode = true;
    this.currentAnnouncementId = announcement.id;
    this.announcementForm.patchValue({
      posttitle: announcement.posttitle,
      postslug: announcement.postslug,
      postdesc: announcement.postdesc,
      creatdate: new Date(announcement.creatdate).toISOString().slice(0, 16)
    });
    this.imagePreview = announcement.postimage;
  }

  deleteAnnouncement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      this.announcementService.deleteAnnouncement(id).subscribe({
        next: () => {
          this.loadAnnouncements();
          alert('Suppression réussie');
        },
        error: (err) => {
          console.error('Erreur de suppression:', err);
          alert('Échec de la suppression');
        }
      });
    }
  }

  resetForm(): void {
    this.announcementForm.reset({
      creatdate: new Date().toISOString().slice(0, 16)
    });
    this.submitted = false;
    this.editMode = false;
    this.currentAnnouncementId = null;
    this.imagePreview = null;
    this.selectedFile = null;
  }
}