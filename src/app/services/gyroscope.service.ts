// gyroscope.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface GyroscopeData {
  id: number;
  user_id: number;
  giroX: number;
  giroY: number;
  giroZ: number;
}

@Injectable({
  providedIn: 'root'
})
export class GyroscopeService {
  private baseUrl = 'https://35.153.187.202:8080/api/sensor-gyroscope/';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllGyroscopeData(userId: number): Observable<GyroscopeData[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<GyroscopeData[]>(
      `${this.baseUrl}all/${userId}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getLatestGyroscopeData(userId: number): Observable<GyroscopeData> {
    const headers = this.getAuthHeaders();
    return this.http.get<GyroscopeData>(
      `${this.baseUrl}gyroscope/latest/${userId}`,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en el servicio Gyroscope:', error.error);
    return throwError(() => new Error('Error al obtener datos del giroscopio'));
  }
}