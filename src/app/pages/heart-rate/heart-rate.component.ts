import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { HeartService } from '../../services/heart.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-heart-rate',
  templateUrl: './heart-rate.component.html',
  imports: [NgFor, NgClass, CommonModule, NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './heart-rate.component.css'
})
export class HeartRateComponent implements OnInit, OnDestroy {
  heartRate: number | null = null;
  heartReadings: any[] = [];
  heartRateQueue: number[] = [];
  averageHeartRate: number | null = null;
  isCollapsed = true;
  private refreshSubscription!: Subscription;
  private websocketSubscription!: Subscription;

  chartData: any[] = [];
  view: [number, number] = [600, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'ID';
  showYAxisLabel = true;
  yAxisLabel = 'Ritmo Cardíaco (bpm)';
  scheme = 'cool';

  constructor(
    private router: Router,
    private heartService: HeartService,
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
    const userId = Number(sessionStorage.getItem('userId'));
    
    // Obtener última lectura
    this.getLatestHeartRate(userId);
    
    // Obtener históricos
    this.heartService.getAllHeartRates(userId).subscribe({
      next: (data) => {
        this.heartReadings = data.slice(-10).reverse();
        this.heartRateQueue = data.slice(-10).map(item => item.bpm);
        this.calculateAverage();
        // Actualizar datos de la gráfica
        this.chartData = [{
          name: 'Ritmo Cardíaco',
          series: this.heartReadings.map(reading => ({
            name: reading.id.toString(),
            value: reading.bpm
          }))
        }];
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener promedio
    this.heartService.getAverageHeartRate(userId).subscribe({
      next: (avg) => {
        this.averageHeartRate = avg.average_heart_rate;
      },
      error: (err) => console.error('Error getting average:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = Number(sessionStorage.getItem('userId'));
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestHeartRate(userId);
    });
  }

  private getLatestHeartRate(userId: number): void {
    this.heartService.getLatestHeartRate(userId).subscribe({
      next: (data) => {
        if (data && data.bpm !== undefined) {
          this.heartRate = data.bpm;
          this.updateQueue(data.bpm);
        } else {
          this.heartRate = null;
        }
      },
      error: (err) => {
        console.error('Error getting latest:', err);
        this.heartRate = null;
      }
    });
  }

  private updateQueue(newValue: number): void {
    if (this.heartRateQueue.length >= 10) {
      this.heartRateQueue.shift();
    }
    this.heartRateQueue.push(newValue);
    this.calculateAverage();
  }

  private calculateAverage() {
    if (this.heartRateQueue.length > 0) {
      this.averageHeartRate = this.heartRateQueue.reduce((a, b) => a + b, 0) / this.heartRateQueue.length;
    } else {
      this.averageHeartRate = null;
    }
  }

  private setupWebSocket(): void {
    this.websocketSubscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          if (notification.type === 'heart_rate') {
            this.heartRate = notification.value;
            this.updateQueue(notification.value);
            this.updateChart();
            Swal.fire({
              title: 'Nueva lectura de frecuencia cardíaca',
              text: `${notification.value} bpm`,
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

  private updateChart(): void {
    this.chartData = [{
      name: 'Frecuencia Cardíaca',
      series: this.heartReadings.map(reading => ({
        name: reading.id.toString(),
        value: reading.bpm
      }))
    }];
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  // Métodos de navegación
  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToAmbient() {
    this.router.navigate(['/ambient']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  navigateToHeartRate() {
    this.router.navigate(['/heart-rate']);
  }

  navigateToTemperature() {
    this.router.navigate(['/temperature']);
  }

  navigateToGyroscope() {
    this.router.navigate(['/gyroscope']);
  }
}