import { Component } from '@angular/core';
import { RecommendationService } from '../../services/recommendation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RecommendationComponent {


  constructor(private recommendationService: RecommendationService) { }

  // Update your component to handle the message
  recommendation: { cluster: number, message: string } | null = null;

  onSubmit(data: any) {
    this.recommendationService.getRecommendation(data).subscribe(
      (response: any) => {
        this.recommendation = {
          cluster: response.cluster,
          message: response.message
        };
      },
      (error) => {
        console.error('Error fetching recommendation', error);
      }
    );
  }
}