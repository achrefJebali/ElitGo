import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certificate } from '../models/certificate';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = 'http://localhost:8085/ElitGo/Formation';

  constructor(private http: HttpClient) { }

  getCertificate(userId: number, formationId: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.apiUrl}/certificate/${userId}/${formationId}`);
  }

  downloadCertificate(userId: number, formationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/certificate/${userId}/${formationId}/download`, { responseType: 'blob' });
  }
}