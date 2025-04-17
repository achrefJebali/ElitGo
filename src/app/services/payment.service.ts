import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8085/ElitGo/api/payments';

  constructor(private http: HttpClient) { }

  initiatePayment(formationId: number, studentEmail: string, userId: number): Observable<string> {
    console.log('Sending payment request with:', { formationId, studentEmail, userId });
    let params = new HttpParams()
      .set('formationId', formationId.toString())
      .set('studentEmail', studentEmail)
      .set('userId', userId.toString());

    return this.http.post<string>(`${this.apiUrl}/create-session`, null, {
      params: params,
      responseType: 'text' as 'json' // Explicitly set responseType to 'text'
    });
  }
}