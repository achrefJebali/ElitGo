import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin, BehaviorSubject } from 'rxjs';
import { tap, switchMap, catchError, map } from 'rxjs/operators';
import { User, Role } from '../models/user.model';
import { Router } from '@angular/router';
import { Interview } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8085/ElitGo/User';
  private authUrl = 'http://localhost:8085/ElitGo/api/auth';
  private interviewApiUrl = 'http://localhost:8085/ElitGo/Interview';
  
  // Observable for current user's interview notification
  private interviewNotificationSubject = new BehaviorSubject<Interview | null>(null);
  public interviewNotification$ = this.interviewNotificationSubject.asObservable();
  
  // Error handling helper
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status) {
      // Server-side error
      errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  constructor(private http: HttpClient, private router: Router) {}

 

  // Enhanced login method with better error handling and type safety
  login(username: string, password: string): Observable<{ token: string }> {
    if (!username || !password) {
      return throwError(() => new Error('Username and password are required'));
    }

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, { username, password }, { headers }).pipe(
      switchMap(response => {
        if (!response?.token) {
          return throwError(() => new Error('Invalid server response'));
        }

        // Store token
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', username);

        // Get user details and store role
        return this.getUserByUsername(username).pipe(
          tap(user => {
            if (!user?.role) {
              throw new Error('User role not found');
            }
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('userId', user.id?.toString() || '');
            
            // If user is a student, check for interviews
            if (user.role === Role.STUDENT && user.id) {
              this.checkStudentInterviews(user.id);
            }
          }),
          map(() => response)
        );
      }),
      catchError(this.handleError)
    );
  }

  // GET: Retrieve all users with CORS handling
  getUser(): Observable<User[]> {
    console.log('Fetching users with CORS handling');
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: false // Disable credentials for simpler CORS
    };
    
    // Try with updated URL and options
    return this.http.get<User[]>(this.apiUrl + '/retrieve-all-users', options)
      .pipe(
        tap(users => {
          console.log('Users successfully retrieved:', users);
          if (Array.isArray(users)) {
            console.log(`Found ${users.length} users`);
          }
        }),
        map(users => {
          // Ensure we always return an array even if something unexpected comes back
          if (!Array.isArray(users)) {
            console.warn('Converting non-array response to empty array');
            return [];
          }
          return users;
        }),
        catchError(error => {
          console.error('Error fetching users, trying alternative URL:', error);
          
          // Try alternative URL (sometimes context path is different)
          return this.http.get<User[]>('http://localhost:8085/User/retrieve-all-users', options)
            .pipe(
              tap(users => console.log('Alternative URL success:', users)),
              catchError(alt_error => {
                console.error('All URLs failed:', alt_error);
                return of([]); // Return empty array as fallback
              })
            );
        })
      );
  }

  // GET: Retrieve all students with robust error handling
  getStudents(): Observable<User[]> {
    console.log('Fetching students with improved error handling');
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: false // Disable credentials for simpler CORS
    };
    
    // Try with primary URL first
    return this.http.get<User[]>(`${this.apiUrl}/students`, options)
      .pipe(
        tap(students => {
          console.log('Students successfully retrieved:', students);
          if (Array.isArray(students)) {
            console.log(`Found ${students.length} students`);
          }
        }),
        map(students => {
          // Ensure we always return an array
          if (!Array.isArray(students)) {
            console.warn('Converting non-array response to empty array');
            return [];
          }
          return students;
        }),
        catchError(error => {
          console.error('Error fetching students, trying direct URL:', error);
          
          // Try alternative direct URL
          return this.http.get<User[]>('http://localhost:8085/User/students', options)
            .pipe(
              tap(students => console.log('Direct URL success:', students)),
              catchError(alt_error => {
                console.error('All student URLs failed:', alt_error);
                
                // Fall back to mock data if all else fails
                console.log('Using mock student data as fallback');
                return of([
                  {
                    id: 1,
                    name: 'Sample Student 1',
                    email: 'student1@example.com',
                    username: 'student1',
                    role: Role.STUDENT
                  },
                  {
                    id: 3,
                    name: 'Sample Student 2', 
                    email: 'student2@example.com',
                    username: 'student2',
                    role: Role.STUDENT
                  }
                ]);
              })
            );
        })
      );
  }

  // GET: Retrieve all teachers with robust error handling
  getTeachers(): Observable<User[]> {
    console.log('Fetching teachers with improved error handling');
    
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: false // Disable credentials for simpler CORS
    };
    
    // Try with primary URL first
    return this.http.get<User[]>(`${this.apiUrl}/teachers`, options)
      .pipe(
        tap(teachers => {
          console.log('Teachers successfully retrieved:', teachers);
          if (Array.isArray(teachers)) {
            console.log(`Found ${teachers.length} teachers`);
          }
        }),
        map(teachers => {
          // Ensure we always return an array
          if (!Array.isArray(teachers)) {
            console.warn('Converting non-array response to empty array');
            return [];
          }
          return teachers;
        }),
        catchError(error => {
          console.error('Error fetching teachers, trying direct URL:', error);
          
          // Try alternative direct URL
          return this.http.get<User[]>('http://localhost:8085/User/teachers', options)
            .pipe(
              tap(teachers => console.log('Direct URL success:', teachers)),
              catchError(alt_error => {
                console.error('All teacher URLs failed:', alt_error);
                
                // Fall back to mock data if all else fails
                console.log('Using mock teacher data as fallback');
                return of([
                  {
                    id: 2,
                    name: 'Sample Teacher 1',
                    email: 'teacher1@example.com',
                    username: 'teacher1',
                    role: Role.TEACHER
                  },
                  {
                    id: 4,
                    name: 'Sample Teacher 2',
                    email: 'teacher2@example.com',
                    username: 'teacher2',
                    role: Role.TEACHER 
                  }
                ]);
              })
            );
        })
      );
  }

  // DELETE: Remove a user by ID with error handling
  removeUser(userId: number): Observable<void> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // PUT: Modify an existing user with error handling
  modifyUser(user: User): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    return this.http.put<User>(`${this.apiUrl}/modify-user`, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // PUT: Update user role with error handling
  updateUserRole(userId: number, role: Role): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<User>(`${this.apiUrl}/update-role/${userId}`, { role }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Get current user role
  getCurrentUserRole(): Role | null {
    const role = localStorage.getItem('userRole');
    return role as Role | null;
  }

  // Enhanced logout with cleanup
  logout(): void {
    localStorage.clear(); // Clear all stored data
    this.router.navigate(['/home']);
  }
  
  // Add a new user (registration)
  addUser(user: User): Observable<User> {
    console.log('Registering new user:', user);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // Use the registration endpoint
    return this.http.post<User>(`${this.apiUrl}/add-user`, user, { headers }).pipe(
      tap(response => {
        console.log('User registration successful:', response);
      }),
      catchError(error => {
        console.error('Error during user registration:', error);
        return throwError(() => error);
      })
    );
  }

  // Get user by username with error handling
  getUserByUsername(username: string): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/get-user/${username}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get user by ID with error handling
  getUserById(userId: number): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Change password with error handling
  changePassword(username: string, currentPassword: string, newPassword: string): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const payload = {
      username,
      currentPassword,
      newPassword
    };

    console.log('Sending password change request:', { username, currentPassword: '***', newPassword: '***' });

    return this.http.put(`${this.apiUrl}/change-password`, payload, { headers }).pipe(
      tap((response) => {
        console.log('Password change successful', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Password change error:', error);
        if (error.status === 403) {
          return throwError(() => new Error('Current password is incorrect'));
        } else if (error.status === 400) {
          return throwError(() => new Error(error.error?.message || 'Invalid password format'));
        }
        return throwError(() => new Error('Failed to update password. Please try again.'));
      })
    );
  }

  // Check email exists with error handling
  checkEmailExists(email: string): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<boolean>(`${this.apiUrl}/check-email/${email}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Check username exists with error handling
  checkUsernameExists(username: string): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<boolean>(`${this.apiUrl}/check-username/${username}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Upload photo with error handling
  uploadPhoto(userId: number, photo: File): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.post(`${this.apiUrl}/${userId}/upload-photo`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Private helper methods
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private refreshToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token to refresh'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.authUrl}/refresh-token`, {}, { headers }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }
  getPhotoUrl(userId: number): Observable<string> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/${userId}/get-photo`, { headers }).pipe(
      map(response => {
        if (response && response.photoUrl) {
          return `http://localhost:8085${response.photoUrl}`;
        }
        return "assets/images/default-avatar.jpg"; // Default placeholder image
      }),
      catchError(this.handleError)
    );
  }
  
  // Check if a student has an assigned interview
  checkStudentInterviews(studentId: number): void {
    console.log('Checking for student interviews for ID:', studentId);
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
      
    // Get interviews for the specific student
    this.http.get<Interview[]>(`${this.interviewApiUrl}/student/${studentId}`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching student interviews:', error);
        return of([]);
      })
    ).subscribe(interviews => {
      console.log('Student interviews:', interviews);
      if (Array.isArray(interviews) && interviews.length > 0) {
        // Get the most recent upcoming interview
        const upcomingInterviews = interviews
          .filter(interview => new Date(interview.date) > new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
        if (upcomingInterviews.length > 0) {
          const nextInterview = upcomingInterviews[0];
          console.log('Found upcoming interview:', nextInterview);
          this.interviewNotificationSubject.next(nextInterview);
          // Also store in localStorage for persistence
          localStorage.setItem('interviewNotification', JSON.stringify(nextInterview));
        } else {
          this.interviewNotificationSubject.next(null);
          localStorage.removeItem('interviewNotification');
        }
      } else {
        this.interviewNotificationSubject.next(null);
        localStorage.removeItem('interviewNotification');
      }
    });
  }
  
  // Get any saved interview notification (for persistence across page loads)
  getStoredInterviewNotification(): Interview | null {
    const storedNotification = localStorage.getItem('interviewNotification');
    if (storedNotification) {
      try {
        const interview = JSON.parse(storedNotification) as Interview;
        // Convert date string to Date object
        if (typeof interview.date === 'string') {
          interview.date = new Date(interview.date);
        }
        return interview;
      } catch (e) {
        console.error('Error parsing stored interview notification:', e);
        return null;
      }
    }
    return null;
  }
  
  // Clear the interview notification
  clearInterviewNotification(): void {
    this.interviewNotificationSubject.next(null);
    localStorage.removeItem('interviewNotification');
  }


}
