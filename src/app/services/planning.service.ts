import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Planning } from '../models/planning.model';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private apiUrl = 'http://localhost:8085/ElitGo/Planning';

  constructor(private http: HttpClient) {}

  addPlanning(planning: Planning): Observable<Planning> {
    return this.http.post<Planning>(`${this.apiUrl}/add-planning`, planning);
  }

  // D'autres méthodes CRUD pourront être ajoutées ici

  updatePlanning(planning: Planning): Observable<Planning> {
    return this.http.put<Planning>(`${this.apiUrl}/modify-planning`, planning);
  }

  getPlanningByEvent(eventId: number): Observable<Planning> {
    return this.http.get<Planning>(`${this.apiUrl}/event/${eventId}`);
  }

  // Méthode pour associer un planning à un événement dans les deux sens
  linkPlanningToEvent(planningId: number, eventId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/link/${planningId}/event/${eventId}`, {});
  }
}
