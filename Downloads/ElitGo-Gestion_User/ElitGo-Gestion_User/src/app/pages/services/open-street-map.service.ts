import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    [key: string]: string | undefined;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenStreetMapService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  
  constructor(private http: HttpClient) { }
  
  /**
   * Search for addresses using OpenStreetMap Nominatim
   * @param query The address search query
   * @returns Observable of address suggestions
   */
  searchAddress(query: string): Observable<string[]> {
    if (!query || query.length < 3) {
      return of([]);
    }
    
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5'
    };
    
    return this.http.get<NominatimResponse[]>(this.nominatimUrl, { params }).pipe(
      map(response => response.map(item => item.display_name)),
      catchError(error => {
        console.error('Error searching addresses:', error);
        return of([]);
      })
    );
  }
}
