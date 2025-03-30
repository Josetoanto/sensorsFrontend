import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { GyroscopeService } from '../../services/gyroscope.service';
import { HeartService } from '../../services/heart.service';
import { LightService } from '../../services/light.service';
import { TemperatureService } from '../../services/temperature.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // Variables para los datos de los sensores
  luzAmbiental: number = 300; // Ejemplo de valor inicial en lux
  ritmoCardiaco: number = 72; // Ejemplo de valor inicial en BPM
  temperaturaCorporal: number = 36.5; // Ejemplo de valor inicial en °C
  inclinacion: number = 15; // Ejemplo de valor inicial en grados
  isCollapsed = false;
  private refreshSubscription!: Subscription;


  constructor(
    private router: Router,
    private gyroscopeService: GyroscopeService,
    private heartService: HeartService,
    private lightService: LightService,
    private temperatureService: TemperatureService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.initData();
    this.setupAutoRefresh();
    
    const storedIsCollapsed = localStorage.getItem('isCollapsed');
    if (storedIsCollapsed) {
      this.isCollapsed = JSON.parse(storedIsCollapsed);
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
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
    this.fetchAllSensorData(userId);
  }

  private setupAutoRefresh(): void {
    const userId = 1;
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.checkAuth();
      this.fetchAllSensorData(userId);
    });
  }

  private fetchAllSensorData(userId: number): void {
    // Giroscopio
    this.gyroscopeService.getLatestGyroscopeData(userId).subscribe({
      next: (data) => {
        this.inclinacion = this.calculateInclination(data);
      },
      error: (err) => this.handleError(err)
    });

    // Ritmo cardíaco
    this.heartService.getLatestHeartRate(userId).subscribe({
      next: (data) => {
        this.ritmoCardiaco = data.bpm;
      },
      error: (err) => this.handleError(err)
    });

    // Luz ambiental
    this.lightService.getLatestIllumination(userId).subscribe({
      next: (data) => {
        this.luzAmbiental = data.luz;
      },
      error: (err) => this.handleError(err)
    });

    // Temperatura
    this.temperatureService.getLatestTemperature(userId).subscribe({
      next: (data) => {
        this.temperaturaCorporal = data.temperatura;
      },
      error: (err) => this.handleError(err)
    });
  }

  private calculateInclination(data: any): number {
    const tiltMagnitude = Math.sqrt(
      Math.pow(data.giroX, 2) + 
      Math.pow(data.giroY, 2) + 
      Math.pow(data.giroZ, 2)
    );
    return Math.abs(Math.round(tiltMagnitude * 10) / 10);
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