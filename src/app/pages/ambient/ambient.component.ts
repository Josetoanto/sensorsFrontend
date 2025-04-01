import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { LightService } from '../../services/light.service';
import { WebsocketService } from '../../services/websocket.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-ambient',
  templateUrl: './ambient.component.html',
  imports: [NgFor, NgClass, CommonModule, NgxChartsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './ambient.component.css'
})
export class AmbientComponent implements OnInit, OnDestroy {
  luzAmbiental: number = 0;
  lightReadings: any[] = [];
  lightQueue: number[] = [];  // Cola para los últimos 10 valores
  promedioLuz: number = 0;
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
  yAxisLabel = 'Luz (lx)';
  scheme = 'cool';

  constructor(
    private router: Router,
    private lightService: LightService,
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
          if (notification.type === 'light') {
            this.luzAmbiental = notification.value;
            this.updateQueue(notification.value);
            this.updateChart();
            alert(`Nueva lectura de luz: ${notification.value} lx`);
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
      name: 'Luz Ambiental',
      series: this.lightReadings.map(reading => ({
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
    const userId = 1;
    
    // Obtener última lectura
    this.getLatestIllumination(userId);
    
    // Obtener históricos
    this.lightService.getAllIlluminations(userId).subscribe({
      next: (data) => {
        this.lightReadings = data.slice(-10).reverse();
        this.lightQueue = data.slice(-10).map(item => item.luz);
        // Actualizar datos de la gráfica
        this.chartData = [{
          name: 'Luz Ambiental',
          series: this.lightReadings.map(reading => ({
            name: reading.id.toString(),
            value: reading.luz
          }))
        }];
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener promedio
    this.lightService.getAverageIllumination(userId).subscribe({
      next: (avg) => this.promedioLuz = avg,
      error: (err) => console.error('Error getting average:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = 1;
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestIllumination(userId);
    });
  }

  private getLatestIllumination(userId: number): void {
    this.lightService.getLatestIllumination(userId).subscribe({
      next: (data) => {
        this.luzAmbiental = data.luz;
        this.updateQueue(data.luz);
      },
      error: (err) => console.error('Error getting latest:', err)
    });
  }

  private updateQueue(newValue: number): void {
    if (this.lightQueue.length >= 10) {
      this.lightQueue.shift();
    }
    this.lightQueue.push(newValue);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  actualizarCola(nuevoValor: number) {
    if (this.lightQueue.length >= 10) {
      this.lightQueue.shift(); // Elimina el valor más antiguo
    }
    this.lightQueue.push(nuevoValor);
    this.calcularPromedio();
  }

  calcularPromedio() {
    if (this.lightQueue.length > 0) {
      this.promedioLuz = this.lightQueue.reduce((a, b) => a + b, 0) / this.lightQueue.length;
    }
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
