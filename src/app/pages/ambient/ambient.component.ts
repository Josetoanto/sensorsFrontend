import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router} from '@angular/router';
import { NgClass } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-ambient',
  imports: [NgFor,NgClass,CommonModule],
  templateUrl: './ambient.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './ambient.component.css'
})


export class AmbientComponent implements OnInit {
  temperatura: number = 0;
  humedad: number = 0;
  any : any;
  isCollapsed = false;
  //dataQueue: SensorData[] = []; 

  constructor(private router: Router) {}

  ngOnInit(): void {
    //this.obtenerSensorData();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
}

  /*obtenerSensorData() {
    Aqui se debe rellenar la cola, si estoy en lo correcto seria mediante una suscripcion al servicio webhook que envia los datos, 
    esto debe actualizar los datos "temperatura" y "humedad" asi como rellenar la dataQueua, con un maximo de largo de cola de 10 segundos
  }*/

    navigateToHome() {
      this.router.navigate(['/home']);
    }
    
    navigateToSensors() {
      this.router.navigate(['/home']);
    }
  
    navigateToSettings() {
      this.router.navigate(['/home']);
    }
}
