import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Announcement } from '../models/announcement';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private apiUrl = 'http://localhost:8085/ElitGo/announcement';

  constructor(private http: HttpClient) {}

  getAnnouncements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(`${this.apiUrl}/retrieve-all`);
  }

  addAnnouncement(formData: FormData): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/add-form`, formData);
  }

  updateAnnouncement(id: number, formData: FormData): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/modify/${id}`, formData);
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}