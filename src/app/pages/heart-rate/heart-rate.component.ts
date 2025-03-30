import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { HeartService } from '../../services/heart.service';

@Component({
  selector: 'app-heart-rate',
  templateUrl: './heart-rate.component.html',
  imports: [NgFor, NgClass, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './heart-rate.component.css'
})
export class HeartRateComponent implements OnInit, OnDestroy {
  heartRate: number = 0;
  heartReadings: any[] = [];
  heartRateQueue: number[] = [];
  averageHeartRate: number = 0;
  isCollapsed = true;
  private refreshSubscription!: Subscription;

  

  constructor(
    private router: Router,
    private heartService: HeartService
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
    
    // Obtener última lectura
    this.getLatestHeartRate(userId);
    
    // Obtener históricos
    this.heartService.getAllHeartRates(userId).subscribe({
      next: (data) => {
        this.heartReadings = data.slice(-10).reverse();
        this.heartRateQueue = data.slice(-10).map(item => item.bpm);
        this.calculateAverage();
      },
      error: (err) => console.error('Error getting all data:', err)
    });

    // Obtener promedio
    this.heartService.getAverageHeartRate(userId).subscribe({
      next: (avg) => {
        this.averageHeartRate = avg.average_heart_rate;
      },
      error: (err) => console.error('Error getting average:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = 1;
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestHeartRate(userId);
    });
  }

  private getLatestHeartRate(userId: number): void {
    this.heartService.getLatestHeartRate(userId).subscribe({
      next: (data) => {
        this.heartRate = data.bpm;
        this.updateQueue(data.bpm);
      },
      error: (err) => console.error('Error getting latest:', err)
    });
  }

  private updateQueue(newValue: number): void {
    if (this.heartRateQueue.length >= 10) {
      this.heartRateQueue.shift();
    }
    this.heartRateQueue.push(newValue);
    this.calculateAverage();
  }

  private calculateAverage() {
    if (this.heartRateQueue.length > 0) {
      this.averageHeartRate = this.heartRateQueue.reduce((a, b) => a + b, 0) / this.heartRateQueue.length;
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