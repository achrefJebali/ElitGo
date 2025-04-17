import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Purchase } from '../models/purchase';
import { Formation } from '../models/formation';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createPurchase(userId: number, formationId: number, paymentReference: string): Observable<Purchase> {
    return this.http.post<Purchase>(`${this.apiUrl}/api/payments/purchase/${userId}/${formationId}?paymentReference=${paymentReference}`, {});
  }

  getPurchasedFormations(userId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/purchased-formations/${userId}`);
  }

  hasPurchasedFormation(userId: number, formationId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/purchase/${userId}/${formationId}/has-purchased`);
  }
}