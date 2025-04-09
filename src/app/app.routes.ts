import { Routes } from '@angular/router';
import { HomeComponent } from './features/user/presentation/pages/home/home.component';
import { LoginComponent } from './features/user/presentation/pages/login/login.component';
import { RegisterComponent } from './features/user/presentation/pages/register/register.component';
import { AmbientComponent } from './features/ligth/presentation/pages/ambient/ambient.component';
import { HeartRateComponent } from './features/heart-rate/presentation/pages/heart-rate/heart-rate.component';
import { TemperatureComponent } from './features/temperature/presentation/pages/temperature/temperature.component';
import { GyroscopeComponent } from './features/gyroscope/presentation/pages/gyroscope/gyroscope.component';
import { ConfigComponent } from './features/user/presentation/pages/config/config.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ambient', component: AmbientComponent },
  { path: 'heart-rate', component: HeartRateComponent },
  { path: 'temperature', component: TemperatureComponent },
  { path: 'gyroscope', component: GyroscopeComponent },
  { path: 'settings', component: ConfigComponent },
  { path: 'landing-page', component: LandingPageComponent }
];
