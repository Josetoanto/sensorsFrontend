import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-temperature',
  imports: [NgFor, CommonModule],
  templateUrl: './temperature.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './temperature.component.css'
})
export class TemperatureComponent implements OnInit {
  temperature: number = 0; // Temperatura en °C
  temperatureHistory: number[] = [];
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

  updateTemperature(newValue: number) {
    if (this.temperatureHistory.length >= 10) {
      this.temperatureHistory.shift(); // Mantener solo los últimos 10 valores
    }
    this.temperatureHistory.push(newValue);
    this.temperature = newValue;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  
  
}