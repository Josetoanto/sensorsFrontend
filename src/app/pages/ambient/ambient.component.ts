import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-ambient',
  imports: [NgFor, NgClass, CommonModule],
  templateUrl: './ambient.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './ambient.component.css'
})
export class AmbientComponent implements OnInit {
  luzAmbiental: number = 0;
  lightQueue: number[] = [];  // Cola para los últimos 10 valores
  promedioLuz: number = 0;
  isCollapsed = false;


  chartOptions: any = {
    chart: {
      type: "radialBar"
    },
    series: [],
    labels: ["Promedio de Luz (lx)"]
  };


  

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí se puede llamar a obtenerSensorData()
  }

  actualizarCola(nuevoValor: number) {
    if (this.lightQueue.length >= 10) {
      this.lightQueue.shift(); // Elimina el valor más antiguo
    }
    this.lightQueue.push(nuevoValor);
    this.calcularPromedio();
  }

  calcularPromedio() {
    if (this.lightQueue.length > 0) {
      this.promedioLuz = this.lightQueue.reduce((a, b) => a + b, 0) / this.lightQueue.length;
      this.actualizarGrafica();
    }
  }

  actualizarGrafica() {
    this.chartOptions.series = [this.promedioLuz]; // Actualiza la gráfica con el nuevo promedio
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
