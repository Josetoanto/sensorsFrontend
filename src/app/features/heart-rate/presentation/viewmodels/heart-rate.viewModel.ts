import { HeartRate} from "../../services/heart.service";

export class HeartRateViewModel {
  heartRate: number | null = null;
  heartRateHistory: number[] = [];
  sensorDataHistory: HeartRate[] = [];
  isCollapsed = true;

  constructor() {}

  updateHeartRate(newValue: number) {
    if (this.heartRateHistory.length >= 10) {
      this.heartRateHistory.shift(); // Mantener solo los últimos 10 valores
    }
    this.heartRateHistory.push(newValue);
    this.heartRate = newValue;
  }

  updateHistory(newData: HeartRate) {
    const exists = this.sensorDataHistory.some(item => item.id === newData.id);
    
    if (!exists) {
      this.sensorDataHistory.unshift(newData);
      
      if (this.sensorDataHistory.length > 10) {
        this.sensorDataHistory.pop();
      }
    }
  }

  calculateAverageHeartRate(): number {
    if (this.heartRateHistory.length === 0) return 0;
    const total = this.heartRateHistory.reduce((sum, rate) => sum + rate, 0);
    return Math.round(total / this.heartRateHistory.length);
  }
}
