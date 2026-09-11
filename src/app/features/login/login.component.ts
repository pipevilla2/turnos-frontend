import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  cedula = '';
  cargando = signal(false);
  error = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  ingresar(): void {
    this.error.set(null);

    if (!/^\d{6,15}$/.test(this.cedula)) {
      this.error.set('Ingresa un número de cédula válido (solo dígitos).');
      return;
    }

    this.cargando.set(true);
    this.authService.loginCliente(this.cedula).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/agendar']);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No fue posible iniciar sesión. Intenta nuevamente.');
      }
    });
  }
}
