import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Client {
  client: any;
  id?: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  backupEmail: string;
  esp32Serial: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = 'https://35.153.187.202:8080/';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}clients`, client);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}login`, credentials)
      .pipe(
        tap(async response => {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('userId', response.userId.toString());

          // Obtener el cliente para almacenar el backupEmail
          const client = await this.getClientById(response.userId).toPromise();
          if (client) {
            console.log('Cliente obtenido:', client);
            sessionStorage.setItem('backupEmail', client.backupEmail); // Almacenar el backupEmail
          }
        })
      );
  }

  getClientById(id: number): Observable<Client> {
    const headers = this.getAuthHeaders();
    return this.http.get<Client>(`${this.baseUrl}clients/${id}`, { headers });
  }

  updateClient(id: number, client: Client): Observable<Client> {
    const headers = this.getAuthHeaders();
    return this.http.put<Client>(`${this.baseUrl}clients/${id}`, client, { headers });
  }
}