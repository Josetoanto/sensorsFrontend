import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config',
  imports: [ NgClass, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent {
  isCollapsed = false;

  constructor(private router: Router) {}


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
