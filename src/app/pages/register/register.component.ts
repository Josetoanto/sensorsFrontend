import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,NgIf], // Añadir módulo de formularios
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true // Asumiendo que es un componente standalone
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private clientService: ClientService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      backupEmail: ['', [Validators.required, Validators.email]]
    }, { validator: this.passwordMatchValidator });
  }

  // Validador personalizado para contraseñas
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      
      const clientData = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        age: formData.age,
        backupEmail: formData.backupEmail
      };

      this.clientService.createClient(clientData).subscribe({
        next: () => {
          alert('Registro exitoso! Por favor inicia sesión.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en registro:', error);
          alert('Error en el registro. Por favor intenta nuevamente.');
        }
      });
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}