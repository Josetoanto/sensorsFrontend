import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import Swal from 'sweetalert2';
import { UserViewModel } from '../../viewmodels/user.viewModel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  viewModel: UserViewModel;

  constructor(private router: Router, private fb: FormBuilder, private clientService: ClientService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.viewModel = new UserViewModel();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      this.clientService.login(credentials).subscribe({
        next: async (response) => {
          sessionStorage.setItem('token', response.token);
          if (response.userId) {
            const user = await this.clientService.getClientById(response.userId).toPromise();
            if (user) {
              this.viewModel.updateUser(user);
              this.router.navigate(['/home']);
            }
          }
        },
        error: (error: any) => {
          console.error('Error en login:', error);
          Swal.fire('Por favor intenta nuevamente.');
        }
      });
    } else {
      Swal.fire('Por favor, ingrese un correo y contraseña válidos.');
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
