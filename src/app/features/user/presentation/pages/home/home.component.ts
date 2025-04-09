import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { GyroscopeData, GyroscopeService } from '../../../../gyroscope/services/gyroscope.service';
import { HeartService } from '../../../../heart-rate/services/heart.service';
import { LightService } from '../../../../ligth/services/light.service';
import { TemperatureService } from '../../../../temperature/services/temperature.service';
import { WebsocketService } from '../../../../notifications/services/websocket.service';
import Swal from 'sweetalert2';
import { ClientService } from '../../../services/client.service';  4
import { Howl } from 'howler';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  luzAmbiental: number | null = null;
  ritmoCardiaco: number | null = null;
  temperaturaCorporal: number | null = null;
  inclinacion: number | null = null;
  isCollapsed = true;
  private refreshSubscription!: Subscription;
  private websocketSubscription!: Subscription;
  

  constructor(
    private router: Router,
    private gyroscopeService: GyroscopeService,
    private heartService: HeartService,
    private lightService: LightService,
    private temperatureService: TemperatureService,
    private websocketService: WebsocketService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.initData();
    this.setupAutoRefresh();
    this.setupWebSocket();
    Notification.requestPermission()
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
    this.fetchAllSensorData(userId);
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('¡Hola!', {
          body: 'Bienvenido a nuestra aplicación',
          icon: 'assets/favicon.ico'
        });
      }
    });
  }

  private setupAutoRefresh(): void {
    const userId = Number(sessionStorage.getItem('userId'));
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.checkAuth();
      this.fetchAllSensorData(userId);
    });
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
          Swal.fire({
            title: 'Nueva notificación',
            text: notification.mensaje || JSON.stringify(notification),
            icon: 'info',
            timer: 10000,
            showConfirmButton: false
          })
        },
        error: (error) => {
          console.error('error en WebSocket:', error);
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

  private fetchAllSensorData(userId: number): void {
    // Giroscopio
    this.gyroscopeService.getLatestGyroscopeData(userId).subscribe({
      next: (data) => {
        this.inclinacion = this.calculateInclination(data);
      },
      error: (err) => {
        this.handleError(err);
        this.inclinacion = null;
      }
    });

    // Ritmo cardíaco
    this.heartService.getLatestHeartRate(userId).subscribe({
      next: (data) => {
        this.ritmoCardiaco = data.bpm;
      },
      error: (err) => {
        this.handleError(err);
        this.ritmoCardiaco = null;
      }
    });

    // Luz ambiental
    this.lightService.getLatestIllumination(userId).subscribe({
      next: (data) => {
        this.luzAmbiental = data.luz;
      },
      error: (err) => {
        this.handleError(err);
        this.luzAmbiental = null;
      }
    });

    // Temperatura
    this.temperatureService.getLatestTemperature(userId).subscribe({
      next: (data) => {
        this.temperaturaCorporal = data.temperatura;
      },
      error: (err) => {
        this.handleError(err);
        this.temperaturaCorporal = null;
      }
    });
  }

  public calculateInclination(data: GyroscopeData): number {
    const angleRadians = Math.atan(data.giroY / data.giroZ); // Calcula el ángulo en radianes
    const angleDegrees = angleRadians * (180 / Math.PI); // Convierte a grados
    return Math.abs(Math.round(angleDegrees * 10) / 10); // Redondea a 1 decimal
}


  private handleError(error: any): void {
    if (error.status === 401) {
      sessionStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
    console.error('Error:', error);
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  
  // Navegación a otras páginas
  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToAmbient() {
    this.router.navigate(['/ambient']);
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

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

}