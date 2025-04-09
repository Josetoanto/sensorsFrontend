import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { LightService } from '../../../services/light.service';
import { WebsocketService } from '../../../../notifications/services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import Swal from 'sweetalert2';
import { Howl } from 'howler';
import { AmbientViewModel } from '../../viewmodels/ambient.viewModel';

@Component({
  selector: 'app-ambient',
  templateUrl: './ambient.component.html',
  imports: [NgFor, NgClass, CommonModule, NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './ambient.component.css'
})
export class AmbientComponent implements OnInit, OnDestroy {
  viewModel: AmbientViewModel;
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
  yAxisLabel = 'Luz (lx)';
  scheme = 'cool';

  constructor(
    private router: Router,
    private lightService: LightService,
    private websocketService: WebsocketService
  ) {
    this.viewModel = new AmbientViewModel();
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

          if (notification.type === 'light') {
            this.viewModel.updateLight(notification.value);
            this.updateChart();
            Swal.fire({
              title: 'Nueva lectura de luz',
              text: `${notification.value} lx`,
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
            timer: 3000,
            showConfirmButton: false
          });
        }
      });
  }

  private updateChart(): void {
    this.chartData = [{
      name: 'Luz Ambiental',
      series: this.viewModel.lightReadings.map(reading => ({
        name: reading.id.toString(),
        value: reading.luz
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
    this.getLatestIllumination(userId);
    
    // Obtener históricos
    this.lightService.getAllIlluminations(userId).subscribe({
      next: (data) => {
        this.viewModel.lightReadings = data.slice(-10).reverse();
        this.viewModel.lightQueue = data.slice(-10).map(item => item.luz);
        this.updateChart();
      },
      error: (err) => console.error('Error getting all data:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = Number(sessionStorage.getItem('userId'));
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestIllumination(userId);
    });
  }

  private getLatestIllumination(userId: number): void {
    this.lightService.getLatestIllumination(userId).subscribe({
      next: (data) => {
        this.viewModel.updateLight(data.luz);
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
