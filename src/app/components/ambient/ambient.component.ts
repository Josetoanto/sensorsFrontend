import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ambient',
  template: '' // Eliminamos el template ya que usaremos alertas
})
export class AmbientComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.subscription = this.websocketService.listenForNotifications()
      .subscribe({
        next: (notification) => {
          console.log('Nueva notificación recibida:', notification);
          alert(`Nueva notificación: ${notification.message}`);
        },
        error: (error) => {
          console.error('Error al recibir notificaciones:', error);
          alert('Error al recibir notificaciones');
        },
        complete: () => {
          console.log('Suscripción a notificaciones completada');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 