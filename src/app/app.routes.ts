import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AmbientComponent } from './pages/ambient/ambient.component';
import { HeartRateComponent } from './pages/heart-rate/heart-rate.component';
import { TemperatureComponent } from './pages/temperature/temperature.component';
import { GyroscopeComponent } from './pages/gyroscope/gyroscope.component';
import { ConfigComponent } from './pages/config/config.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ambient', component: AmbientComponent },
  { path: 'heart-rate', component: HeartRateComponent },
  { path: 'temperature', component: TemperatureComponent },
  { path: 'gyroscope', component: GyroscopeComponent },
  { path: 'settings', component: ConfigComponent },
];
