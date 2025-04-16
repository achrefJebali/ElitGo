import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class GoogleMeetService {
  // Google API configuration from environment settings
  private readonly API_KEY = environment.googleApi.apiKey;
  private readonly CLIENT_ID = environment.googleApi.clientId;
  
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}
  
  /**
   * Génère un lien vers une réunion Jitsi Meet
   * Cette solution fonctionne immédiatement sans authentification
   */
  createMeetingWithCalendarEvent(
    summary: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendees: string[]
  ): Observable<string> {
    // Créer un identifiant de réunion unique basé sur un timestamp et un nombre aléatoire
    const meetingId = `elitgo-${startTime.getTime()}-${Math.floor(Math.random() * 1000)}`.replace(/[^a-zA-Z0-9]/g, '');
    
    // Créer un lien Jitsi Meet (solution Open Source qui fonctionne instantanément sans authentification)
    const jitsiLink = `https://meet.jit.si/${meetingId}`;
    
    console.log('Lien de réunion Jitsi créé:', jitsiLink);
    return of(jitsiLink);
  }
  
  /**
   * Crée une URL pour intégrer une réunion Jitsi Meet dans un iframe
   * Ça permet d'intégrer la réunion directement dans votre application
   */
  getJitsiEmbedUrl(meetingLink: string): SafeResourceUrl {
    // Vérifier si c'est un lien Jitsi
    if (meetingLink && meetingLink.includes('meet.jit.si')) {
      // Transformer le lien en URL d'iframe
      const embedUrl = meetingLink.replace('https://meet.jit.si/', 'https://meet.jit.si/') + '#config.startWithVideoMuted=true';
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(meetingLink);
  }
  
  /**
   * Génère un lien de réunion Jitsi, qui fonctionne sans authentification
   * @returns URL d'une réunion Jitsi Meet
   */
  generateJitsiMeetLink(): string {
    const randomId = Math.random().toString(36).substring(2, 10);
    return `https://meet.jit.si/ElitGo-${randomId}`;
  }
}
