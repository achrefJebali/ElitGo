import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { User, Role } from '../models/user.model';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8085/ElitGo/User';
  private authUrl = 'http://localhost:8085/ElitGo/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // POST method to add a new user
  addUser(user: User): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.post<User>(`${this.apiUrl}/add-user`, user, { headers });
  }

  // Méthode de connexion
  login(username: string, password: string): Observable<{ token: string }> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, { username, password }, { headers }).pipe(
      map(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', username);
        }
        return response;
      })
    );
  }

  // GET: Retrieve all users
  getUser(): Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User[]>(`${this.apiUrl}/retrieve-all-users`, { headers });
  }

  // GET: Retrieve all students
  getStudents(): Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User[]>(`${this.apiUrl}/students`, { headers });
  }

  // GET: Retrieve all teachers
  getTeachers(): Observable<User[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User[]>(`${this.apiUrl}/teachers`, { headers });
  }

  // DELETE: Remove a user by ID
  removeUser(userId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, { headers });
  }

  // PUT: Modify an existing user
  modifyUser(user: User): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<User>(`${this.apiUrl}/modify-user`, user, { headers });
  }

  // PUT: Update user role
  updateUserRole(userId: number, role: Role): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<User>(`${this.apiUrl}/update-role/${userId}`, { role }, { headers });
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
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/get-user/${username}`, { headers });
  }

  getUserById(userId: number): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`, { headers });
  }

  changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/users/change-password`, {
      username,
      currentPassword,
      newPassword
    }, { headers });
  }

  checkEmailExists(email: string): Observable<boolean> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}`, { headers });
  }

  checkUsernameExists(username: string): Observable<boolean> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<boolean>(`${this.apiUrl}/check-username/${username}`, { headers });
  }

  uploadPhoto(userId: number, photo: File): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.post(`${this.apiUrl}/${userId}/upload-photo`, formData, { headers });
  }
}
