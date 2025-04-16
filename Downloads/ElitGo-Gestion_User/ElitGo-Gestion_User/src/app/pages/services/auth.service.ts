import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8085/ElitGo/api/auth';
  private authDataKey = 'auth_data';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ token: string; user: User }> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }, { headers }).pipe(
      switchMap(response => {
        if (!response?.token) {
          return throwError(() => new Error('Invalid response: token not found'));
        }
        
        // Store token immediately
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', username);
        
        // Get user details using the token
        const authHeaders = new HttpHeaders()
          .set('Authorization', `Bearer ${response.token}`)
          .set('Content-Type', 'application/json');
          
        return this.http.get<User>(`${this.apiUrl}/user`, { headers: authHeaders }).pipe(
          map(user => ({
            token: response.token,
            user: user
          })),
          tap(result => {
            this.setAuthData(result);
          })
        );
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.authDataKey);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getUserRole(): string | null {
    const authData = this.getAuthData();
    return authData?.user?.role || null;
  }

  getUser(): User | null {
    const authData = this.getAuthData();
    return authData?.user || null;
  }

  private setAuthData(data: { token: string; user: User }): void {
    const authData = {
      token: data.token,
      user: data.user,
      timestamp: new Date().getTime()
    };
    localStorage.setItem(this.authDataKey, JSON.stringify(authData));
    this.isAuthenticatedSubject.next(true);
  }

  private getAuthData(): any {
    const authDataStr = localStorage.getItem(this.authDataKey);
    try {
      return authDataStr ? JSON.parse(authDataStr) : null;
    } catch {
      return null;
    }
  }

  private hasValidToken(): boolean {
    const authData = this.getAuthData();
    if (!authData?.token || !authData?.user) {
      return false;
    }
    // Check if token is not expired (assuming 24h validity)
    const tokenAge = new Date().getTime() - authData.timestamp;
    const tokenValidityPeriod = 24 * 60 * 60 * 1000; // 24 hours
    return tokenAge < tokenValidityPeriod;
  }

  getAuthHeaders(): HttpHeaders {
    const authData = this.getAuthData();
    return new HttpHeaders({
      'Authorization': `Bearer ${authData?.token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Request a password reset email for the given email address
   * @param email The user's email address
   * @returns Observable of the request result
   */
  requestPasswordReset(email: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { headers }).pipe(
      catchError(error => {
        console.error('Password reset request error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Validate a password reset token
   * @param token The password reset token to validate
   * @returns Observable of the validation result
   */
  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-reset-token?token=${token}`).pipe(
      catchError(error => {
        console.error('Token validation error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Reset password with the given token and new password
   * @param token The password reset token
   * @param newPassword The new password
   * @returns Observable of the reset result
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new URLSearchParams();
    params.set('token', token);
    params.set('password', newPassword);
    
    return this.http.post(`${this.apiUrl}/reset-password?${params.toString()}`, {}).pipe(
      catchError(error => {
        console.error('Password reset error:', error);
        return throwError(() => error);
      })
    );
  }
}
