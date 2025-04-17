import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ressource } from '../models/ressource';

@Injectable({ providedIn: 'root' })
export class RessourceService {
  private baseUrl = 'http://localhost:8085/ElitGo/Ressource';

  constructor(private http: HttpClient) {}

  getAllRessources(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${this.baseUrl}/retrieve-all-ressource`);
  }

  getRessourcesByFormation(formationId: number): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${this.baseUrl}/by-formation/${formationId}`);
  }

  addRessource(ressource: Partial<Ressource>): Observable<Ressource> {
    return this.http.post<Ressource>(`${this.baseUrl}/add-ressource`, ressource);
  }

  updateRessource(ressource: Partial<Ressource>): Observable<Ressource> {
    // Use the correct REST endpoint as per backend changes
    return this.http.put<Ressource>(`${this.baseUrl}/modify-ressource/${ressource.id}`, ressource);
  }

  deleteRessource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/remove-ressource/${id}`);
  }

  uploadVideo(formData: FormData): Observable<Ressource> {
    // Use the new /videos/upload endpoint
    return this.http.post<Ressource>('http://localhost:8085/ElitGo/videos/upload', formData);
  }

  updateVideo(id: number, formData: FormData): Observable<Ressource> {
    return this.http.put<Ressource>(`http://localhost:8085/ElitGo/videos/update/${id}`, formData);
  }
}
