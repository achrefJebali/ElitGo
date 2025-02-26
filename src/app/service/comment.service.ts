import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment'; // L'importation de l'interface Comment

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  // Correction du chemin pour correspondre à @RequestMapping("/comments")
  private apiUrl = 'http://localhost:8085/ElitGo/comments'; 

  constructor(private http: HttpClient) {}

  addComment(comment: Comment): Observable<Comment> {
    // Utiliser le bon endpoint "/add-comment"
    return this.http.post<Comment>(`${this.apiUrl}/add-comment`, comment);
  }

  getComments(): Observable<Comment[]> {
    // Utiliser le bon endpoint "/retrieve-all-comments"
    return this.http.get<Comment[]>(`${this.apiUrl}/retrieve-all-comments`);
  }

  deleteComment(id: number): Observable<void> {
    // Utiliser le bon endpoint "/remove-comment/{id}"
    return this.http.delete<void>(`${this.apiUrl}/remove-comment/${id}`);
  }

  updateComment(comment: Comment): Observable<Comment> {
    // Utiliser le bon endpoint "/modify-comment"
    return this.http.put<Comment>(`${this.apiUrl}/modify-comment`, comment);
  }
}