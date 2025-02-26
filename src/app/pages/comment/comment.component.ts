import { Component } from '@angular/core';
import { Comment } from '../../models/comment';
import { CommentService } from '../../service/comment.service';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from "../../pages/layout/layout.component";
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-comment',
  standalone: true, // Add this line
  imports: [FormsModule, LayoutComponent, FooterComponent], // Add this line
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent {
  comment: Comment = {
    content: '',
    date: new Date().toISOString()  // Par défaut, la date sera celle du jour
  };

  constructor(private commentService: CommentService) {}

  submitComment(commentForm: any) {
    if (commentForm.valid) {
      // Envoi du commentaire à l'API (via le service)
      this.commentService.addComment(this.comment).subscribe({
        next: (response) => {
          console.log('Commentaire ajouté', response);
          commentForm.reset(); // Réinitialiser le formulaire après soumission
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du commentaire', error);
        }
      });
    }
  }
}
