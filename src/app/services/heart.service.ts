import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para las respuestas
export interface HeartRate {
  id: number;
  bpm: number;
  user_id: number;
}

export interface AverageHeartRateResponse {
  average_heart_rate: number;
}

export interface LatestHeartRate {
  id: number;
  bpm: number;
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class HeartService {
  private baseUrl = 'https://35.153.187.202:8080/';
  private HIGH_THRESHOLD = 100;
  private LOW_THRESHOLD = 60;

  constructor(private http: HttpClient) { }

  // Obtener todas las lecturas de ritmo cardíaco
  getAllHeartRates(userId: number): Observable<HeartRate[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<HeartRate[]>(
      `${this.baseUrl}api/sensor-heart-rate/all/${userId}`,
      { headers }
    );
  }

  // Obtener promedio de ritmo cardíaco
  async getAverageHeartRate(userId: number): Promise<AverageHeartRateResponse | undefined> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const response = await this.http.get<AverageHeartRateResponse>(
      `${this.baseUrl}api/sensor-heart-rate/heart-rate/average/${userId}`,
      { headers }
    ).toPromise();
    return response;
  }

  // Obtener última lectura de ritmo cardíaco
  getLatestHeartRate(userId: number): Observable<LatestHeartRate> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<LatestHeartRate>(
      `${this.baseUrl}api/sensor-heart-rate/heart-rate/latest/${userId}`,
      { headers }
    );
  }
}