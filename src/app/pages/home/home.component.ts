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
    const storedIsCollapsed = localStorage.getItem('isCollapsed');
    if (storedIsCollapsed) {
      this.isCollapsed = JSON.parse(storedIsCollapsed);
    }
    // Aquí podrías configurar llamadas iniciales a tus sensores o simulaciones
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