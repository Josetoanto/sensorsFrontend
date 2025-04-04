import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para las respuestas
export interface Temperature {
  id: number;
  temperatura: number;
  user_id: number;
}

export interface AverageTemperatureResponse {
  average_temperature: number;
}

@Injectable({
  providedIn: 'root'
})
export class TemperatureService {
  private baseUrl = 'http://35.153.187.202:8080/';

  constructor(private http: HttpClient) { }

  // Obtener todas las lecturas de temperatura
  getAllTemperatures(userId: number): Observable<Temperature[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Temperature[]>(
      `${this.baseUrl}api/sensor-TH/all/${userId}`,
      { headers }
    );
  }

  // Obtener promedio de temperatura
  getAverageTemperature(userId: number): Observable<AverageTemperatureResponse> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<AverageTemperatureResponse>(
      `${this.baseUrl}api/sensor-TH/temperature/average/${userId}`,
      { headers }
    );
  }

  // Obtener última lectura de temperatura
  getLatestTemperature(userId: number): Observable<Temperature> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<Temperature>(
      `${this.baseUrl}api/sensor-TH/temperature/latest/${userId}`,
      { headers }
    );
  }
}