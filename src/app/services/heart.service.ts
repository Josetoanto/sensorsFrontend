import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GmailService } from './gmail.service';

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
  private baseUrl = 'http://35.153.187.202:8080/';
  private HIGH_THRESHOLD = 100;
  private LOW_THRESHOLD = 60;

  constructor(private http: HttpClient, private gmailService: GmailService) { }

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

    if (response && (response.average_heart_rate > this.HIGH_THRESHOLD || response.average_heart_rate < this.LOW_THRESHOLD)) {
      const backupEmail = sessionStorage.getItem('backupEmail');
      if (backupEmail) {
        const subject = 'Alerta de Ritmo Cardíaco';
        const body = `Su ritmo cardíaco promedio es ${response.average_heart_rate}, que está fuera de los límites normales.`;
        await this.gmailService.sendEmail(backupEmail, subject, body);
      }
    }

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