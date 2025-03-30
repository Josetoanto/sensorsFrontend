import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { TemperatureService } from '../../services/temperature.service';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  imports: [NgFor, NgClass, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './temperature.component.css'
})
export class TemperatureComponent implements OnInit, OnDestroy {
  temperature: number = 0;
  temperatureReadings: any[] = [];
  temperatureQueue: number[] = [];
  averageTemperature: number = 0;
  isCollapsed = true;
  private refreshSubscription!: Subscription;

  constructor(
    private router: Router,
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
    
    this.getLatestTemperature(userId);
    
    this.temperatureService.getAllTemperatures(userId).subscribe({
      next: (data) => {
        this.temperatureReadings = data.slice(-10).reverse();
        this.temperatureQueue = data.slice(-10).map(item => item.temperatura);
        this.calculateAverage();
      },
      error: (err) => console.error('Error getting temperature data:', err)
    });

    this.temperatureService.getAverageTemperature(userId).subscribe({
      next: (avg) => {
        this.averageTemperature = avg.average_temperature;
      },
      error: (err) => console.error('Error getting average temperature:', err)
    });
  }

  private setupAutoRefresh(): void {
    const userId = 1;
    this.refreshSubscription = timer(0, 60000).subscribe(() => {
      this.getLatestTemperature(userId);
    });
  }

  private getLatestTemperature(userId: number): void {
    this.temperatureService.getLatestTemperature(userId).subscribe({
      next: (data) => {
        this.temperature = data.temperatura;
        this.updateQueue(data.temperatura);
      },
      error: (err) => console.error('Error getting latest temperature:', err)
    });
  }

  private updateQueue(newValue: number): void {
    if (this.temperatureQueue.length >= 10) {
      this.temperatureQueue.shift();
    }
    this.temperatureQueue.push(newValue);
    this.calculateAverage();
  }

  private calculateAverage() {
    if (this.temperatureQueue.length > 0) {
      this.averageTemperature = this.temperatureQueue.reduce((a, b) => a + b, 0) / this.temperatureQueue.length;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  // Métodos de navegación
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}