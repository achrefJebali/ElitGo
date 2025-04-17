import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Ressource } from 'app/models/ressource';
import { RessourceService } from 'app/services/ressource.service';
import { FormationService } from 'app/services/formation.service';
import { Formation } from 'app/models/formation';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProgressService } from 'app/services/progress.service'; // Assuming ProgressService is defined in this file
import { LayoutComponent } from 'app/pages/layout/layout.component';

@Component({
  selector: 'app-startformation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,LayoutComponent],
  templateUrl: './startformation.component.html',
  styleUrls: ['./startformation.component.css']
})
export class StartFormationComponent implements OnInit {
  formation: Formation | null = null;
  resources: Ressource[] = [];
  videoUrl: string | null = null;
  currentLessonId: number | null = null;
  watchedVideos: Set<number> = new Set();
  allVideoIds: number[] = [];
  currentIndex: number = 0;
  showNext: boolean = false;

  @ViewChild('player', { static: false }) player!: ElementRef<HTMLVideoElement>;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: RessourceService,
    private formationService: FormationService,
    private router: Router,
    private progressService: ProgressService // Inject ProgressService
  ) { }

  ngOnInit(): void {
    const formationId = Number(this.route.snapshot.paramMap.get('id'));
    const userId = 1; // Assuming userId is defined or retrieved from somewhere
    // Fetch formation details from DB
    this.formationService.getFormationById(formationId).subscribe((formation) => {
      this.formation = formation;
    });
    this.ressourceService.getRessourcesByFormation(formationId).subscribe((ressources) => {
      this.resources = ressources;
      // Automatically select the first resource with a video fileUrl
      const firstVideo = this.resources.find(res => res.fileUrl);
      this.videoUrl = firstVideo ? 'http://localhost:8085/ElitGo' + firstVideo.fileUrl : null;
      // Populate allVideoIds from your ressources/videos list
      this.allVideoIds = this.resources.map(r => r.id); // Adjust as needed
    });
    this.progressService.getWatchedVideos(userId, formationId).subscribe(ids => {
      this.watchedVideos = new Set(ids);
    });
  }

  onVideoEnded(ressource: Ressource) {
    if (!this.watchedVideos.has(ressource.id)) {
      const userId = 1; // Replace with actual userId logic
      const formationId = Number(this.route.snapshot.paramMap.get('id'));
      this.progressService.markVideoWatched(userId, formationId, ressource.id).subscribe(() => {
        this.watchedVideos.add(ressource.id);
        this.showNext = true;
        if (this.watchedVideos.size === this.allVideoIds.length) {
          const progressUpdate = {
            videosCompleted: true,
            progressPercentage: 99,
            quizScore: 0
          };
          this.progressService.updateProgress(userId, formationId, progressUpdate).subscribe(() => {
            this.loadProgressIfAvailable();
          });
        } else {
          this.loadProgressIfAvailable();
        }
      });
    } else {
      this.showNext = true;
    }
  }

  nextVideo() {
    if (this.currentIndex < this.resources.length - 1) {
      this.currentIndex++;
      this.showNext = false;
    }
  }

  prevVideo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showNext = false;
    }
  }

  goBackToPurchased(): void {
    this.router.navigate(['/purchased-formations']);
  }

  startQuiz() {
    // TODO: Implement navigation to quiz or quiz modal logic here
    // Example: this.router.navigate(['/formation', this.formationId, 'quiz']);
    alert('Quiz starting! (Implement your quiz logic here)');
  }

  // Helper to reload progress if ProgressComponent is present
  loadProgressIfAvailable() {
    // If ProgressComponent is a child, call its loadProgress method
    // This is a placeholder; adjust based on your actual component structure
    // Example:
    // if (this.progressComponent) {
    //   this.progressComponent.loadProgress();
    // }
    // Or use an event emitter/output if parent-child
  }
}
