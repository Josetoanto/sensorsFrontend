import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 5000; // 5 segundos
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor() {
    const userID = sessionStorage.getItem('userId') || '0'; 
    this.connectSocket(userID);
  }

  private connectSocket(userID: string): void {
    try {
      console.log(`Intentando conectar WebSocket para usuario ${userID}...`);
      this.socket = new WebSocket(`ws://44.197.127.252:8083/ws/handshake?user_id=${userID}`);

      this.socket.onopen = () => {
        console.log('Cliente conectado al WebSocket');
        this.reconnectAttempts = 0; // Resetear intentos de reconexión
      };

      this.socket.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        this.handleReconnect(userID);
      };

      this.socket.onclose = (event) => {
        console.log('Conexión WebSocket cerrada:', event);
        console.log('Código de cierre:', event.code);
        console.log('Razón del cierre:', event.reason);
        this.handleReconnect(userID);
      };

      // Restaurar el manejador de mensajes si existe
      if (this.messageHandler) {
        this.socket.onmessage = this.messageHandler;
      }
    } catch (error) {
      console.error('Error al crear WebSocket:', error);
      this.handleReconnect(userID);
    }
  }

  private handleReconnect(userID: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intento de reconexión ${this.reconnectAttempts} de ${this.maxReconnectAttempts}`);
      setTimeout(() => this.connectSocket(userID), this.reconnectTimeout);
    } else {
      console.error('Se alcanzó el número máximo de intentos de reconexión');
    }
  }

  listenForNotifications(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error('WebSocket no está conectado');
        return;
      }

      // Guardar el manejador de mensajes actual
      this.messageHandler = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Mensaje recibido:', message);
          observer.next(message);
        } catch (error) {
          console.error('Error al parsear mensaje:', error);
          observer.error('Error al procesar el mensaje');
        }
      };

      // Asignar el manejador de mensajes
      this.socket.onmessage = this.messageHandler;

      // Manejar errores
      this.socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
        observer.error('Error en la conexión WebSocket: ' + error);
      };

      // Manejar cierre
      this.socket.onclose = (event) => {
        console.warn('WebSocket cerrado:', event);
        observer.complete();
      };

      // Función de limpieza
      return () => {
        // No cerramos la conexión, solo removemos el manejador de mensajes
        if (this.socket) {
          this.socket.onmessage = null;
        }
      };
    });
  }

  registerUser(): void {
    console.log('User registered');
  }

  ngOnDestroy(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Destruyendo servicio WebSocket...');
      this.socket.close();
    }
  }
} 