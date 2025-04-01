import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { TemperatureService } from '../../services/temperature.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  imports: [NgFor, NgClass, CommonModule, NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './temperature.component.css'
})
export class TemperatureComponent implements OnInit, OnDestroy {
  temperature: number = 0;
  temperatureReadings: any[] = [];
  temperatureQueue: number[] = [];
  averageTemperature: number = 0;
  isCollapsed = true;
  private refreshSubscription!: Subscription;
  private websocketSubscription!: Subscription;

  // Configuración de la gráfica
  chartData: any[] = [];
  view: [number, number] = [600, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'ID';
  showYAxisLabel = true;
  yAxisLabel = 'Temperatura (°C)';
  scheme = 'cool';

  constructor(
    private router: Router,
    private temperatureService: TemperatureService,
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

  private setupWebSocket(): void {
    this.websocketSubscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          if (notification.type === 'temperature') {
            this.temperature = notification.value;
            this.updateQueue(notification.value);
            this.updateChart();
            alert(`Nueva lectura de temperatura: ${notification.value}°C`);
          } else {
            alert(`Nueva notificación: ${JSON.stringify(notification)}`);
          }
        },
        error: (error) => {
          console.error('Error en WebSocket:', error);
          alert('Error al recibir datos del WebSocket');
        }
      });
  }

  private updateChart(): void {
    this.chartData = [{
      name: 'Temperatura',
      series: this.temperatureReadings.map(reading => ({
        name: reading.id.toString(),
        value: reading.temperatura
      }))
    }];
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
    
    // Obtener última lectura
    this.getLatestTemperature(userId);
    
    // Obtener históricos
    this.temperatureService.getAllTemperatures(userId).subscribe({
      next: (data) => {
        this.temperatureReadings = data.slice(-10).reverse();
        this.temperatureQueue = data.slice(-10).map(item => item.temperatura);
        this.calculateAverage();
        // Actualizar datos de la gráfica
        this.chartData = [{
          name: 'Temperatura',
          series: this.temperatureReadings.map(reading => ({
            name: reading.id.toString(),
            value: reading.temperatura
          }))
        }];
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener promedio
    this.temperatureService.getAverageTemperature(userId).subscribe({
      next: (avg) => {
        this.averageTemperature = avg.average_temperature;
      },
      error: (err) => console.error('Error getting average:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = 1;
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestTemperature(userId);
    });
  }

  private getLatestTemperature(userId: number): void {
    this.temperatureService.getLatestTemperature(userId).subscribe({
      next: (data) => {
        this.temperature = data.temperatura;
        this.updateQueue(data.temperatura);
      },
      error: (err) => console.error('Error getting latest:', err)
    });
  }

  private updateQueue(newValue: number): void {
    if (this.temperatureQueue.length >= 10) {
      this.temperatureQueue.shift();
    }
    this.temperatureQueue.push(newValue);
    this.calculateAverage();
  }

  private calculateAverage() {
    if (this.temperatureQueue.length > 0) {
      this.averageTemperature = this.temperatureQueue.reduce((a, b) => a + b, 0) / this.temperatureQueue.length;
    }
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