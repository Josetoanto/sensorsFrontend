import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { GyroscopeService, GyroscopeData } from '../../../services/gyroscope.service';
import { WebsocketService } from '../../../../notifications/services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';
import { Howl } from 'howler';
import { GyroscopeViewModel } from '../../viewmodels/gyroscope.viewModel';


@Component({
  selector: 'app-gyroscope',
  imports: [NgFor, CommonModule, NgxChartsModule],
  templateUrl: './gyroscope.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './gyroscope.component.css'
})

export class GyroscopeComponent implements OnInit, OnDestroy {
  viewModel: GyroscopeViewModel;
  private refreshSubscription!: Subscription;
  private websocketSubscription!: Subscription;

  constructor(
    private router: Router,
    private gyroscopeService: GyroscopeService,
    private websocketService: WebsocketService
  ) {
    this.viewModel = new GyroscopeViewModel();
  }

  ngOnInit(): void {
    this.checkAuth();
    this.initData();
    this.setupAutoRefresh();
    this.setupWebSocket();
    
    const storedIsCollapsed = localStorage.getItem('isCollapsed');
    if (storedIsCollapsed) {
      this.viewModel.isCollapsed = JSON.parse(storedIsCollapsed);
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
    const userId = Number(sessionStorage.getItem('userId'));
    
    // Obtener todos los datos históricos
    this.gyroscopeService.getAllGyroscopeData(userId).subscribe({
      next: (data) => {
        this.viewModel.sensorDataHistory = data.slice(-10).reverse();
        if (this.viewModel.sensorDataHistory.length > 0) {
          this.viewModel.inclination = this.calculateInclination(
            this.viewModel.sensorDataHistory[0]
          );
        }
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener última lectura
    this.getLatestGyroscopeData(userId);
  }

  private setupAutoRefresh(): void {
    const userId = Number(sessionStorage.getItem('userId'));
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestGyroscopeData(userId);
    });
  }

  private getLatestGyroscopeData(userId: number): void {
    this.gyroscopeService.getLatestGyroscopeData(userId).subscribe({
      next: (data) => {
        this.viewModel.inclination = this.calculateInclination(data);
        this.viewModel.updateHistory(data);
      },
      error: (err) => console.error('Error getting latest:', err)
    });
  }

  private updateHistory(newData: GyroscopeData): void {
    this.viewModel.updateHistory(newData);
  }

  public calculateInclination(data: GyroscopeData): number {
    return this.viewModel.calculateInclination(data);
  }

  trackBySensorData(index: number, item: GyroscopeData): number {
    return item.id;
  }

  toggleSidebar() {
    this.viewModel.isCollapsed = !this.viewModel.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.viewModel.isCollapsed));
  }

  updateInclination(newValue: number) {
    if (this.viewModel.inclinationHistory.length >= 10) {
      this.viewModel.inclinationHistory.shift(); // Mantener solo los últimos 10 valores
    }
    this.viewModel.inclinationHistory.push(newValue);
    this.viewModel.inclination = newValue;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  private setupWebSocket(): void {
    this.websocketSubscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          const sonido = new Howl({
            src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'],
            volume: 5
          });
          sonido.play();
          if (notification.type === 'gyroscope') {
            this.viewModel.gyroscopeData = notification.value;
            this.updateReadings(notification.value);
            Swal.fire({
              title: 'Nueva lectura del giroscopio',
              html: `X: ${notification.value.x}<br>Y: ${notification.value.y}<br>Z: ${notification.value.z}`,
              icon: 'info',
              timer: 10000,
              showConfirmButton: false
            });
          } else {
            Swal.fire({
              title: 'Nueva notificación',
              text: notification.mensaje || JSON.stringify(notification),
              icon: 'info',
              timer: 10000,
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
            timer: 10000,
            showConfirmButton: false
          });
        }
      });
  }

  private updateReadings(newData: any): void {
    this.viewModel.gyroscopeReadings.push(newData);
    if (this.viewModel.gyroscopeReadings.length > 10) {
      this.viewModel.gyroscopeReadings.shift();
    }
  }
}