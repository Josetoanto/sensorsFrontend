import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router} from '@angular/router';

@Component({
  selector: 'app-ambient',
  imports: [NgFor],
  templateUrl: './ambient.component.html',
  styleUrl: './ambient.component.css'
})


export class AmbientComponent implements OnInit {
  temperatura: number = 0;
  humedad: number = 0;
  any : any;
  //dataQueue: SensorData[] = []; 

  constructor(private router: Router) {}

  ngOnInit(): void {
    //this.obtenerSensorData();
  }

  /*obtenerSensorData() {
    Aqui se debe rellenar la cola, si estoy en lo correcto seria mediante una suscripcion al servicio webhook que envia los datos, 
    esto debe actualizar los datos "temperatura" y "humedad" asi como rellenar la dataQueua, con un maximo de largo de cola de 10 segundos
  }*/

    navigateTo(route: string) {
      this.router.navigate([route]);
    }
}
