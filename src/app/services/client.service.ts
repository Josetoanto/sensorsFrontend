import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Client {
  id?: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  backupEmail: string;
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
  private baseUrl = 'http://35.153.187.202:8080/';

  constructor(private http: HttpClient) { }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}clients`, client);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}login`, credentials)
      .pipe(
        tap(response => {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('userId', response.userId.toString());
        })
      );
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}clients/${id}`);
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}clients/${id}`, client);
  }
}