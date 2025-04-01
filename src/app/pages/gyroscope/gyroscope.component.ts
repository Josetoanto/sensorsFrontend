import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { GyroscopeService, GyroscopeData } from '../../services/gyroscope.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gyroscope',
  imports: [NgFor, CommonModule, NgxChartsModule],
  templateUrl: './gyroscope.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './gyroscope.component.css'
})
export class GyroscopeComponent implements OnInit, OnDestroy {
  inclination: number = 0; // Inclinación en grados
  inclinationHistory: number[] = [];
  sensorDataHistory: GyroscopeData[] = [];
  gyroscopeData: any = { x: 0, y: 0, z: 0 };
  gyroscopeReadings: any[] = [];
  isCollapsed = true;
  private refreshSubscription!: Subscription;
  private websocketSubscription!: Subscription;

  constructor(
    private router: Router,
    private gyroscopeService: GyroscopeService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.initData();
    this.setupAutoRefresh();
    this.setupWebSocket();
    
    const storedIsCollapsed = localStorage.getItem('isCollapsed');
    if (storedIsCollapsed) {
      this.isCollapsed = JSON.parse(storedIsCollapsed);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  private checkAuth(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  private initData(): void {
    const userId = 1;
    
    // Obtener todos los datos históricos
    this.gyroscopeService.getAllGyroscopeData(userId).subscribe({
      next: (data) => {
        this.sensorDataHistory = data.slice(-10).reverse();
        if (this.sensorDataHistory.length > 0) {
          this.inclination = this.calculateInclination(
            this.sensorDataHistory[0]
          );
        }
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener última lectura
    this.getLatestGyroscopeData(userId);
  }

  private setupAutoRefresh(): void {
    const userId = 1;
    this.refreshSubscription = timer(0, 5000).subscribe(() => {
      this.getLatestGyroscopeData(userId);
    });
  }

  private getLatestGyroscopeData(userId: number): void {
    this.gyroscopeService.getLatestGyroscopeData(userId).subscribe({
      next: (data) => {
        this.inclination = this.calculateInclination(data);
        this.updateHistory(data);
      },
      error: (err) => console.error('Error getting latest:', err)
    });
  }

  private updateHistory(newData: GyroscopeData): void {
    // Verificar si el dato ya existe en el historial
    const exists = this.sensorDataHistory.some(item => item.id === newData.id);
    
    if (!exists) {
      // Añadir al principio del array
      this.sensorDataHistory.unshift(newData);
      
      // Mantener solo los últimos 10 elementos
      if (this.sensorDataHistory.length > 10) {
        this.sensorDataHistory.pop();
      }
    }
  }

  public calculateInclination(data: GyroscopeData): number {
    const tiltMagnitude = Math.sqrt(
      Math.pow(data.giroX, 2) + 
      Math.pow(data.giroY, 2) + 
      Math.pow(data.giroZ, 2)
    );
    return Math.abs(Math.round(tiltMagnitude * 10) / 10);
  }

  trackBySensorData(index: number, item: GyroscopeData): number {
    return item.id;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  updateInclination(newValue: number) {
    if (this.inclinationHistory.length >= 10) {
      this.inclinationHistory.shift(); // Mantener solo los últimos 10 valores
    }
    this.inclinationHistory.push(newValue);
    this.inclination = newValue;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  private setupWebSocket(): void {
    this.websocketSubscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          if (notification.type === 'gyroscope') {
            this.gyroscopeData = notification.value;
            this.updateReadings(notification.value);
            Swal.fire({
              title: 'Nueva lectura del giroscopio',
              html: `X: ${notification.value.x}<br>Y: ${notification.value.y}<br>Z: ${notification.value.z}`,
              icon: 'info',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: 'Nueva notificación',
              text: notification.mensaje || JSON.stringify(notification),
              icon: 'info',
              timer: 5000,
              showConfirmButton: false
            });
          }
        },
        error: (error) => {
          console.error('Error en WebSocket:', error);
          Swal.fire({
            title: 'Error',
            text: 'Error al recibir datos del WebSocket',
            icon: 'error',
            timer: 3000,
            showConfirmButton: false
          });
        }
      });
  }

  private updateReadings(newData: any): void {
    this.gyroscopeReadings.push(newData);
    if (this.gyroscopeReadings.length > 10) {
      this.gyroscopeReadings.shift();
    }
  }
}