import { GyroscopeData } from "../../services/gyroscope.service";

export class GyroscopeViewModel {
  inclination: number | null = null;
  inclinationHistory: number[] = [];
  sensorDataHistory: GyroscopeData[] = [];
  gyroscopeData: any = { x: 0, y: 0, z: 0 };
  gyroscopeReadings: any[] = [];
  isCollapsed = true;

  constructor() {}

  updateInclination(newValue: number) {
    if (this.inclinationHistory.length >= 10) {
      this.inclinationHistory.shift(); 
    }
    this.inclinationHistory.push(newValue);
    this.inclination = newValue;
  }

  updateHistory(newData: GyroscopeData) {
    const exists = this.sensorDataHistory.some(item => item.id === newData.id);
    
    if (!exists) {
      this.sensorDataHistory.unshift(newData);
      
      if (this.sensorDataHistory.length > 10) {
        this.sensorDataHistory.pop();
      }
    }
  }

  calculateInclination(data: GyroscopeData): number {
    const angleRadians = Math.atan(data.giroY / data.giroZ);
    const angleDegrees = angleRadians * (180 / Math.PI);
    return Math.abs(Math.round(angleDegrees * 10) / 10);
  }
}
