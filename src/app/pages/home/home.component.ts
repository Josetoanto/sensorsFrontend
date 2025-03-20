import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí podrías configurar llamadas iniciales a tus sensores o simulaciones
    this.simularDatos(); // Para pruebas
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Simulación de datos para pruebas
  simularDatos() {
    setInterval(() => {
      this.luzAmbiental = Math.floor(Math.random() * 1000); // Simula entre 0 y 1000 lx
      this.ritmoCardiaco = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Entre 60 y 100 BPM
      this.temperaturaCorporal = +(Math.random() * (38 - 36) + 36).toFixed(1); // Entre 36.0 y 38.0 °C
      this.inclinacion = Math.floor(Math.random() * 360); // Entre 0 y 360 grados
    }, 3000); // Actualiza cada 3 segundos
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