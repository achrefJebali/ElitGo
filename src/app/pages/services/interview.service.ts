import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError, map, retry, timeout, of, switchMap } from 'rxjs';
import { Interview } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  // Direct API URL without relying on token authentication
  private apiUrl = 'http://localhost:8085/ElitGo/Interview';

  constructor(public http: HttpClient) { }

  public getHeaders(): HttpHeaders {
    // Simplified headers without token to ensure API access
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  }

  getAllInterviews(): Observable<Interview[]> {
    console.log('Fetching all interviews using safer approach');
    const headers = this.getHeaders();
    
    // Try the new safer endpoint specifically designed to avoid circular references
    return this.http.get<any>(`${this.apiUrl}/interviews-safe`, { 
      headers, 
      // Disable caching to always get fresh data
      params: { 'nocache': new Date().getTime().toString() }
    }).pipe(
      tap(response => {
        console.log('Interviews received from safe endpoint:', response);
        if (Array.isArray(response)) {
          console.log(`Retrieved ${response.length} interviews successfully`);
        }
      }),
      // Convert the raw response to Interview objects
      map(response => {
        if (!Array.isArray(response)) {
          console.warn('Non-array response received, returning empty array');
          return [];
        }
        
        // Map the raw objects to Interview objects
        return response.map(item => {
          const interview: Interview = {
            id: item.id,
            date: item.date ? new Date(item.date) : new Date(),
            duration: item.duration || 30,
            meeting_link: item.meeting_link || '',
            notes: item.notes || '',
            feedback: item.feedback || '',
            score: item.score || 0,
            extraBonus: item.extraBonus || 0
          };
          
          // Handle nested student object
          if (item.student && typeof item.student === 'object' && item.student.id) {
            interview.studentId = Number(item.student.id);
            interview.studentName = item.student.name || 'Unknown Student';
            interview.student = {
              id: Number(item.student.id),
              name: item.student.name || ''
            };
            console.log(`Found nested student in API response:`, interview.student);
          } else if (item.studentId) {
            interview.studentId = Number(item.studentId);
            interview.studentName = item.studentName || 'Unknown Student';
          }
          
          // Handle nested teacher object
          if (item.teacher && typeof item.teacher === 'object' && item.teacher.id) {
            interview.teacherId = Number(item.teacher.id);
            interview.teacherName = item.teacher.name || 'Unknown Teacher';
            interview.teacher = {
              id: Number(item.teacher.id),
              name: item.teacher.name || ''
            };
            console.log(`Found nested teacher in API response:`, interview.teacher);
          } else if (item.teacherId) {
            interview.teacherId = Number(item.teacherId);
            interview.teacherName = item.teacherName || 'Unknown Teacher';
          }
          
          return interview;
        });
      }),
      catchError(error => {
        console.error('Error with safe endpoint:', error);
        console.log('Trying fallback endpoint...');
        
        // Try the original endpoint as fallback
        return this.http.get<any>(`${this.apiUrl}/retrieve-all-interviews`, {
          headers,
          params: { 'nocache': new Date().getTime().toString() }
        }).pipe(
          tap(response => console.log('Fallback endpoint response:', response)),
          map(response => {
            if (!Array.isArray(response)) {
              return [];
            }
            return response.map(item => ({
              id: item.id || 0,
              studentId: item.studentId || null,
              teacherId: item.teacherId || null,
              studentName: item.studentName || 'Unknown',
              teacherName: item.teacherName || 'Unknown',
              date: item.date ? new Date(item.date) : new Date(),
              duration: item.duration || 30,
              meeting_link: item.meeting_link || '',
              notes: item.notes || ''
            } as Interview));
          }),
          catchError(() => {
            console.log('Using mock data as last resort');
            return of([]); // Return empty array if all fails
          })
        );
      })
    );
  }

  // Check if a student already has an interview
  studentHasInterview(studentId: number): Observable<boolean> {
    console.log('Checking if student has an existing interview:', studentId);
    const headers = this.getHeaders();
    
    return this.http.get<Interview[]>(`${this.apiUrl}/student/${studentId}`, { headers })
      .pipe(
        map(interviews => {
          // Filter to get only future interviews
          const futureInterviews = interviews.filter(interview => {
            const interviewDate = new Date(interview.date);
            return interviewDate > new Date();
          });
          
          console.log(`Student ${studentId} has ${futureInterviews.length} future interviews`);
          return futureInterviews.length > 0;
        }),
        catchError(error => {
          console.error('Error checking student interviews:', error);
          return of(false); // Return false on error to allow interview creation
        })
      );
  }
  
  addInterview(interview: Interview): Observable<Interview> {
    console.log('Adding interview with simplified approach:', interview);
    const headers = this.getHeaders();
    
    // Validate required fields to prevent errors
    if (!interview.studentId || !interview.teacherId || !interview.date) {
      console.error('Missing required fields for interview');
      return throwError(() => new Error('Student, teacher and date are required'));
    }
    
    // Check if student already has an interview before creating a new one
    return this.studentHasInterview(interview.studentId).pipe(
      switchMap(hasInterview => {
        if (hasInterview) {
          console.error('Student already has an interview scheduled');
          return throwError(() => new Error('This student already has an interview scheduled. Each student can only have one interview at a time.'));
        }
    
        // Create a simplified interview object with only the essential data
        // This avoids complex objects that might cause circular references
        const simplifiedInterview = {
          studentId: interview.studentId,
          teacherId: interview.teacherId,
          date: interview.date instanceof Date ? interview.date.toISOString() : interview.date,
          duration: interview.duration || 30, // Default to 30 minutes if not specified
          meeting_link: interview.meeting_link || '',
          notes: interview.notes || ''
        };
        
        console.log('Simplified interview for backend:', simplifiedInterview);
        
        // Try with the simplified format
        return this.tryPostWithSimplifiedFormat(simplifiedInterview, headers);
      })
    );
  }
  
  // Helper method with simplified format and more robust error handling
  private tryPostWithSimplifiedFormat(simplifiedInterview: any, headers: HttpHeaders): Observable<Interview> {
    console.log('Posting simplified interview data...');
    
    // Options with timeout to prevent hanging requests
    const httpOptions = {
      headers: headers,
      // Use text response type since we might get a non-JSON error response
      responseType: 'text' as 'json'
    };
    
    // Create a payload string manually to ensure proper formatting
    const payload = JSON.stringify(simplifiedInterview);
    console.log('Raw payload:', payload);
    
    // Make a direct post request with text response handling
    console.log('Trying simplified endpoint at:', `${this.apiUrl}/add-interview-simple`);
    return this.http.post(`${this.apiUrl}/add-interview-simple`, payload, httpOptions)
      .pipe(
        timeout(15000),  // Longer timeout for potential slow response
        retry(2),        // More retries
        map(response => {
          console.log('Success response:', response);
          // Parse the response if it's a string
          if (typeof response === 'string') {
            try {
              return JSON.parse(response) as Interview;
            } catch (e) {
              console.log('Response is not JSON, returning as is');
              // Create a minimal interview object as fallback
              return {
                id: 0,
                studentId: simplifiedInterview.studentId,
                teacherId: simplifiedInterview.teacherId,
                date: new Date(simplifiedInterview.date),
                duration: simplifiedInterview.duration
              } as Interview;
            }
          }
          return response as unknown as Interview;
        }),
        catchError(error => {
          console.error('Error with primary endpoint:', error);
          // Try one more approach with different parameters
          return this.fallbackInterviewCreation(simplifiedInterview);
        })
      );
  }

  deleteInterview(id: number): Observable<void> {
    console.log(`Deleting interview with ID: ${id}`);
    const headers = this.getHeaders();
    
    return this.http.delete<void>(`${this.apiUrl}/remove-interview/${id}`, { headers })
      .pipe(
        tap(() => console.log(`Interview with ID ${id} deleted successfully`)),
        catchError(error => {
          console.error(`Error deleting interview with ID ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  updateInterview(interview: Interview): Observable<Interview> {
    console.log('Updating interview:', interview);
    const headers = this.getHeaders();
    
    // Ensure date is properly formatted
    const interviewToUpdate = {
      ...interview,
      // Convert date to ISO string if it's a Date object
      date: interview.date instanceof Date ? interview.date.toISOString() : interview.date
    };
    
    console.log('Formatted interview for update:', interviewToUpdate);
    
    return this.http.put<Interview>(`${this.apiUrl}/modify-interview`, interviewToUpdate, { headers })
      .pipe(
        tap(response => console.log('Interview updated, response:', response)),
        catchError(error => {
          console.error('Error updating interview:', error);
          return throwError(() => error);
        })
      );
  }

  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`${operation} failed:`, error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('Error details:', error.error);
      
      // Let the app keep running by returning an empty result
      return throwError(() => new Error(`${operation} failed: ${this.getErrorMessage(error)}`));
    };
  }
  
  // Last resort fallback attempt to create an interview
  private fallbackInterviewCreation(simplifiedInterview: any): Observable<Interview> {
    console.log('Attempting fallback interview creation approach');
    
    // Even more simplified payload with minimal data
    const minimalPayload = {
      student: { id: simplifiedInterview.studentId },
      teacher: { id: simplifiedInterview.teacherId },
      date: simplifiedInterview.date,
      duration: simplifiedInterview.duration || 30
    };
    
    // Try with different content type and URL
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }),
      withCredentials: false
    };
    
    return this.http.post<Interview>(`http://localhost:8085/ElitGo/Interview/add-interview`, minimalPayload, options)
      .pipe(
        tap(response => console.log('Fallback success:', response)),
        catchError(error => {
          console.error('All interview creation approaches failed:', error);
          return throwError(() => new Error(`Could not schedule interview. Please try again later.`));
        })
      );
  }
  
  private getErrorMessage(error: HttpErrorResponse): string {
    // Try to extract a meaningful error message
    if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else if (error.status === 0) {
      return 'Cannot connect to server. Please check your network connection.';
    } else if (error.status === 400) {
      return 'Bad request. Please check the interview details.';
    } else if (error.status === 404) {
      return 'API endpoint not found.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    }
    return 'An unknown error occurred.';
  }
}
