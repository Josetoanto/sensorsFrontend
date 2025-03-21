import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-heart-rate',
  imports: [NgFor, NgClass, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  templateUrl: './heart-rate.component.html',
  styleUrl: './heart-rate.component.css'
})
export class HeartRateComponent implements OnInit {
  heartRate: number = 0;
  heartRateQueue: number[] = [];
  averageHeartRate: number = 0;
  isCollapsed = true;

  chartOptions: any = {
    chart: {
      type: "radialBar"
    },
    series: [],
    labels: ["Promedio de Ritmo Cardíaco (bpm)"]
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedIsCollapsed = localStorage.getItem('isCollapsed');
    if (storedIsCollapsed) {
      this.isCollapsed = JSON.parse(storedIsCollapsed);
    }
    // Aquí se puede llamar a obtenerSensorData()
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('isCollapsed', JSON.stringify(this.isCollapsed));
  }

  updateQueue(newValue: number) {
    if (this.heartRateQueue.length >= 10) {
      this.heartRateQueue.shift();
    }
    this.heartRateQueue.push(newValue);
    this.calculateAverage();
  }

  calculateAverage() {
    if (this.heartRateQueue.length > 0) {
      this.averageHeartRate = this.heartRateQueue.reduce((a, b) => a + b, 0) / this.heartRateQueue.length;
      this.updateChart();
    }
  }

  updateChart() {
    this.chartOptions.series = [this.averageHeartRate];
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
