import { LightSensor } from "../../services/light.service";

export class AmbientViewModel {
  luzAmbiental: number | null = null;
  lightReadings: LightSensor[] = [];
  lightQueue: number[] = [];
  promedioLuz: number = 0;

  constructor() {}

  updateLight(newValue: number) {
    if (this.lightQueue.length >= 10) {
      this.lightQueue.shift(); // Mantener solo los últimos 10 valores
    }
    this.lightQueue.push(newValue);
    this.luzAmbiental = newValue;
    this.calcularPromedio();
  }

  updateHistory(newData: LightSensor) {
    const exists = this.lightReadings.some(item => item.id === newData.id);
    
    if (!exists) {
      this.lightReadings.unshift(newData);
      
      if (this.lightReadings.length > 10) {
        this.lightReadings.pop();
      }
    }
  }

  calcularPromedio() {
    if (this.lightQueue.length > 0) {
      this.promedioLuz = this.lightQueue.reduce((a, b) => a + b, 0) / this.lightQueue.length;
    }
  }
}