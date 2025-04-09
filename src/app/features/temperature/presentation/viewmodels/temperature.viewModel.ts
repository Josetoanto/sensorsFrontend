import { Temperature } from "../../services/temperature.service";

export class TemperatureViewModel {
  temperature: number | null = null;
  temperatureReadings: Temperature[] = [];
  temperatureQueue: number[] = [];
  averageTemperature: number = 0;

  constructor() {}

  updateTemperature(newValue: number) {
    if (this.temperatureQueue.length >= 10) {
      this.temperatureQueue.shift(); // Mantener solo los últimos 10 valores
    }
    this.temperatureQueue.push(newValue);
    this.temperature = newValue;
    this.calculateAverage();
  }

  updateHistory(newData: Temperature) {
    const exists = this.temperatureReadings.some(item => item.id === newData.id);
    
    if (!exists) {
      this.temperatureReadings.unshift(newData);
      
      if (this.temperatureReadings.length > 10) {
        this.temperatureReadings.pop();
      }
    }
  }

  calculateAverage() {
    if (this.temperatureQueue.length > 0) {
      this.averageTemperature = this.temperatureQueue.reduce((a, b) => a + b, 0) / this.temperatureQueue.length;
    }
  }
}