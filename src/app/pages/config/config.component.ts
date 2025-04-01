import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-config',
  imports: [ NgClass, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  private websocketSubscription!: Subscription;

  constructor(
    private router: Router,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.setupWebSocket();
    
    const storedIsCollapsed = localStorage.getItem('isCollapsed');
    if (storedIsCollapsed) {
      this.isCollapsed = JSON.parse(storedIsCollapsed);
    }
    // Aquí se puede llamar a obtenerSensorData()
  }

  private setupWebSocket(): void {
    this.websocketSubscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          alert(`Nueva notificación: ${JSON.stringify(notification)}`);
        },
        error: (error) => {
          console.error('Error en WebSocket:', error);
          alert('Error al recibir datos del WebSocket');
        }
      });
  }
  private checkAuth(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }
  ngOnDestroy(): void {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
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
