import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { TemperatureService } from '../../../services/temperature.service';
import { WebsocketService } from '../../../../notifications/services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';
import { TemperatureViewModel } from '../../viewmodels/temperature.viewModel';
import { Howl } from 'howler';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  imports: [NgFor, NgClass, CommonModule, NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './temperature.component.css'
})
export class TemperatureComponent implements OnInit, OnDestroy {
  viewModel: TemperatureViewModel;
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
  ) {
    this.viewModel = new TemperatureViewModel();
  }

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
          const sonido = new Howl({
            src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'],
            volume: 5
          });
          sonido.play();
          if (notification.type === 'temperature') {
            this.viewModel.updateTemperature(notification.value);
            this.updateChart();
            Swal.fire({
              title: 'Nueva lectura de temperatura',
              text: `${notification.value} °C`,
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

  private updateChart(): void {
    this.chartData = [{
      name: 'Temperatura',
      series: this.viewModel.temperatureReadings.map(reading => ({
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
    const userId = Number(sessionStorage.getItem('userId'));
    
    // Obtener última lectura
    this.getLatestTemperature(userId);
    
    // Obtener históricos
    this.temperatureService.getAllTemperatures(userId).subscribe({
      next: (data) => {
        this.viewModel.temperatureReadings = data.slice(-10).reverse();
        this.viewModel.temperatureQueue = data.slice(-10).map(item => item.temperatura);
        this.updateChart();
        this.viewModel.calculateAverage();
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener promedio
    this.temperatureService.getAverageTemperature(userId).subscribe({
      next: (avg) => {
        this.viewModel.averageTemperature = avg.average_temperature;
      },
      error: (err) => console.error('Error getting average:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = Number(sessionStorage.getItem('userId'));
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestTemperature(userId);
    });
  }

  private getLatestTemperature(userId: number): void {
    this.temperatureService.getLatestTemperature(userId).subscribe({
      next: (data) => {
        this.viewModel.updateTemperature(data.temperatura);
        this.viewModel.updateHistory(data);
        this.updateChart();
      },
      error: (err) => console.error('Error getting latest:', err)
    });
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