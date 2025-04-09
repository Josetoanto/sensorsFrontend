import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WebsocketService } from '../../../../notifications/services/websocket.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { UserViewModel } from '../../viewmodels/user.viewModel';

@Component({
  selector: 'app-config',
  imports: [ NgClass, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit, OnDestroy {
  viewModel: UserViewModel;
  private websocketSubscription!: Subscription;

  constructor(
    private router: Router,
    private websocketService: WebsocketService
  ) {
    this.viewModel = new UserViewModel();
  }

  ngOnInit(): void {
    this.checkAuth();
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.websocketSubscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          Swal.fire({
            title: 'Nueva notificación',
            text: notification.mensaje || JSON.stringify(notification),
            icon: 'info',
            timer: 5000,
            showConfirmButton: false
          });
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

  private checkAuth(): void {
    if (!this.viewModel.isUserAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.viewModel.toggleSidebar();
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
