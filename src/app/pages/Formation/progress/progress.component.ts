import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationService } from '../../../services/formation.service';
import { ProgressService } from '../../../services/progress.service';
import { CertificateService } from '../../../services/certificate.service';
import { Formation } from '../../../models/formation';
import { Progress } from '../../../models/progress';
import { Certificate } from '../../../models/certificate';
import { retry } from 'rxjs/operators';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css'
})
export class ProgressComponent implements OnInit {
  @Input() formationId!: number;
  @Input() userId!: number;

  formation: Formation | null = null;
  progress: Progress | null = null;
  certificate: Certificate | null = null;
  errorMessage: string = '';
  isLoadingProgress: boolean = false;
  private PASSING_SCORE = 70;

  constructor(
    private formationService: FormationService,
    private progressService: ProgressService,
    private certificateService: CertificateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadFormation();
    this.loadProgress();
  }

  loadFormation(): void {
    this.formationService.getFormationById(this.formationId).subscribe({
      next: (formation) => {
        this.formation = formation;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load formation';
      }
    });
  }

  loadProgress(): void {
    this.isLoadingProgress = true;
    this.progressService.getProgress(this.userId, this.formationId).pipe(
      retry({ count: 3, delay: 2000 })
    ).subscribe({
      next: (progress) => {
        this.progress = progress;
        this.errorMessage = '';
        this.checkCertificate();
        this.isLoadingProgress = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error) => {
        this.errorMessage = `Failed to load progress: ${error.message}`;
        this.isLoadingProgress = false;
      }
    });
  }

  checkCertificate(): void {
    if (this.progress && this.progress.videosCompleted && this.isQuizPassed()) {
      this.certificateService.getCertificate(this.userId, this.formationId).subscribe({
        next: (certificate) => {
          this.certificate = certificate;
        },
        error: (error) => {
          if (error.status === 403) {
            this.certificate = null;
          } else {
            this.errorMessage = 'Failed to load certificate';
          }
        }
      });
    } else {
      this.certificate = null;
    }
  }

  isQuizPassed(): boolean {
    const passed = this.progress?.quizScore != null && this.progress.quizScore > this.PASSING_SCORE;
    return passed || false;
  }

  get progressPercentage(): number {
    const percentage = this.progress?.progressPercentage ?? 0;
    return percentage;
  }

  downloadCertificate(event: Event): void {
    event.preventDefault();
    if (this.certificate) {
      this.certificateService.downloadCertificate(this.userId, this.formationId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificate_${this.userId}_${this.formationId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.errorMessage = '';
        },
        error: (error) => {
          if (error.status === 403) {
            this.errorMessage = 'You are not eligible to download this certificate. Please complete all videos and score above 70 on the quiz.';
          } else if (error.status === 500 && error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Failed to download certificate. Please try again later.';
          }
        }
      });
    } else {
      this.errorMessage = 'No certificate available to download.';
    }
  }
}