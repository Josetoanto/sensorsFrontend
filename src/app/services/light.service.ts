import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaces para las respuestas
export interface LightSensor {
  id: number;
  user_id: number;
  luz: number;
}

export interface AverageLightResponse {
  average_temperature: number;
}

@Injectable({
  providedIn: 'root'
})
export class LightService {
  private baseUrl = 'http://35.153.187.202:8080/';

  constructor(private http: HttpClient) { }

  // Obtener todas las lecturas de luz
  getAllIlluminations(userId: number): Observable<LightSensor[]> {
    const token = sessionStorage.getItem('token');
    console.log()
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<LightSensor[]>(
      `${this.baseUrl}api/sensor-light/all/${userId}`,
      { headers }
    );
  }

  // Obtener promedio de iluminación
  getAverageIllumination(userId: number): Observable<number> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<AverageLightResponse>(
      `${this.baseUrl}api/sensor-light/light/average/${userId}`,
      { headers }
    ).pipe(
      map(response => response.average_temperature)
    );
  }

  // Obtener última lectura de luz
  getLatestIllumination(userId: number): Observable<LightSensor> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<LightSensor>(
      `${this.baseUrl}api/sensor-light/light/latest/${userId}`,
      { headers }
    );
  }
}