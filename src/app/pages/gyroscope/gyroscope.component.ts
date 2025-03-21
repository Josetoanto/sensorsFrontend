import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-gyroscope',
  imports: [NgFor, CommonModule],
  templateUrl: './gyroscope.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './gyroscope.component.css'
})
export class GyroscopeComponent implements OnInit {
  inclination: number = 0; // Inclinación en grados
  inclinationHistory: number[] = [];
  isCollapsed = true;


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

  updateInclination(newValue: number) {
    if (this.inclinationHistory.length >= 10) {
      this.inclinationHistory.shift(); // Mantener solo los últimos 10 valores
    }
    this.inclinationHistory.push(newValue);
    this.inclination = newValue;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  
}