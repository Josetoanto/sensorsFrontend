import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import Swal from 'sweetalert2';
import { UserViewModel } from '../../viewmodels/user.viewModel';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  standalone: true
})
export class RegisterComponent {
  registerForm: FormGroup;
  viewModel: UserViewModel;

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
      age: ['', Validators.required],
      backupEmail: ['emergencymail@gmail.com', [Validators.required, Validators.email]],
      esp32Serial: ['', Validators.required]
    });
    this.viewModel = new UserViewModel();
  }

  onSubmit() {
    this.registerUser();
  }

  private registerUser() {
    const clientData = this.registerForm.value;
    this.clientService.createClient(clientData).subscribe({
      next: () => {
        Swal.fire("Registro exitoso! Por favor inicia sesión.");
      
        this.router.navigate(['/login']);
      },
      error: (error) => {
        Swal.fire('Error en el registro. Inténtalo nuevamente.');
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}