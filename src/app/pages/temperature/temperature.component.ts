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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí puedes agregar la lógica para recibir los datos en tiempo real
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

  toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('sidebar-collapsed');
  }
}