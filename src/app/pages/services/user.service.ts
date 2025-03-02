import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Role } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8085/ElitGo/User';
  private authUrl = 'http://localhost:8085/ElitGo/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  private getAuthHeaders(includeContentType: boolean = true): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (includeContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  // POST method to add a new user
  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/add-user`, user, {
      headers: this.getAuthHeaders()
    });
  }

  // Méthode de connexion
  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, { username, password }, {
      headers: this.getAuthHeaders()
    });
  }

  // GET: Retrieve all users
  getUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/retrieve-all-users`, {
      headers: this.getAuthHeaders(false)
    });
  }

  // GET: Retrieve all students
  getStudents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/students`, {
      headers: this.getAuthHeaders(false)
    });
  }

  // GET: Retrieve all teachers
  getTeachers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/teachers`, {
      headers: this.getAuthHeaders(false)
    });
  }

  // DELETE: Remove a user by ID
  removeUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders(false)
    });
  }

  // PUT: Modify an existing user
  modifyUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/modify-user`, user, {
      headers: this.getAuthHeaders()
    });
  }

  // PUT: Update user role
  updateUserRole(userId: number, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}/role`, { role }, {
      headers: this.getAuthHeaders()
    });
  }

  // 🔹 Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // 🔹 Déconnexion de l'utilisateur
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/']);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get-user/${username}`, {
      headers: this.getAuthHeaders(false)
    });
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders(false)
    });
  }

 

  changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, {
      username,
      currentPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    });
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}`, {
      headers: this.getAuthHeaders(false)
    });
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-username/${username}`, {
      headers: this.getAuthHeaders(false)
    });
  }

  uploadPhoto(userId: number, photo: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', photo);
    // Don't include Content-Type header for FormData
    const headers = this.getAuthHeaders(false);
    return this.http.post(`${this.apiUrl}/${userId}/upload-photo`, formData, {
      headers: headers
    });
  }
}
