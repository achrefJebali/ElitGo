import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Feedback } from '../../models/feedback';
import { FeedbackService } from '../../service/feedback.service';

@Component({
  selector: 'app-feedback',
  standalone: true, 
  imports: [CommonModule, FormsModule], // ✅ Importation correcte des modules nécessaires
  providers: [FeedbackService], // ✅ Ajout du service ici
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {

  feedbacks: Feedback[] = [];
  newFeedback: Feedback = { like: 0, dislike: 0 }; 

  constructor(private feedbackService: FeedbackService) { }

  ngOnInit(): void {
    this.loadFeedbacks();  
  }

  // Récupérer les feedbacks depuis l'API
  loadFeedbacks(): void {
    this.feedbackService.getFeedbacks().subscribe((data: Feedback[]) => {
      this.feedbacks = data;
    });
  }

  // Ajouter un feedback
  addFeedback(): void {
    if (this.newFeedback.like >= 0 && this.newFeedback.dislike >= 0) {
      this.feedbackService.addFeedback(this.newFeedback).subscribe((data: Feedback) => {
        this.feedbacks.push(data);
        this.newFeedback = { like: 0, dislike: 0 }; 
      });
    }
  }

  // Supprimer un feedback
  deleteFeedback(id: number): void {
    this.feedbackService.deleteFeedback(id).subscribe(() => {
      this.feedbacks = this.feedbacks.filter(feedback => feedback.id !== id); 
    });
  }
}
