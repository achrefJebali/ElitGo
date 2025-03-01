import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8085/ElitGo/User';
  private authUrl = 'http://localhost:8085/ElitGo/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // POST method to add a new user
  addUser(user: User): Observable<User> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<User>(`${this.apiUrl}/add-user`, user, { headers });
  }
  // Méthode de connexion
  login(username: string, password: string): Observable<{ token: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, { username, password }, { headers });
  }
  // GET: Retrieve all users
  getUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/retrieve-all-users`);
  }

    // DELETE: Remove a user by ID
  removeUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove-user/${userId}`);
  }

  // PUT: Modify an existing user
  modifyUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/modify-user`, user);
  }
  // 🔹 Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🔹 Déconnexion de l'utilisateur
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // ✅ Supprimer aussi le username
    this.router.navigate(['/']); // Navigate to home page
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get-user/${username}`);
  }
  // Add this method for password change
  changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, 
      { username, currentPassword, newPassword }, 
      { responseType: 'json' } // ✅ Expect JSON response
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}`);
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username/${username}`);
  }
}
