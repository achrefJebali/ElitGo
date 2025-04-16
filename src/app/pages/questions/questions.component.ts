import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-question',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
  imports: [CommonModule, RouterModule]
})
export class QuestionComponent implements OnInit {
  questions: Question[] = [];

  constructor(
    private questionService: QuestionService,
    private route: ActivatedRoute // Récupérer les paramètres de la route
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions() {
    this.questionService.getAllQuestions().subscribe(
      (data: Question[]) => {
        this.questions = data;
        console.log(this.questions); // Pour vérifier si les données sont bien récupérées
      },
      (error) => {
        console.error('Erreur lors de la récupération des questions', error);
      }
    );
  }

  // Méthode pour passer l'ID dans la route pour la mise à jour
  updateQuestion(id: number) {
    this.route.params.subscribe(params => {
      console.log(params['id']); // Log l'ID pour vérifier
    });
  }
  deleteQuestion(id?: number) {
    if (id !== undefined) {
      if (confirm('Es-tu sûr de vouloir supprimer cette question ?')) {
        this.questionService.deleteQuestion(id).subscribe(
          () => {
            this.questions = this.questions.filter(q => q.question_id !== id);
            console.log('Question supprimée avec succès');
          },
          (error) => {
            console.error('Erreur lors de la suppression de la question', error);
          }
        );
      }
    } else {
      console.warn('ID de la question est undefined');
    }
  }
  
  
}
