import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf]
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private clientService: ClientService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.clientService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/home']); // Cambia la ruta según necesites
        },
        error: (error) => {
          console.error('Error en login:', error);
          alert('Credenciales incorrectas. Por favor intenta nuevamente.');
        }
      });
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}