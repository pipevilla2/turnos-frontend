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
  autenticado = signal(false);

  readonly teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

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
        this.autenticado.set(true);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No fue posible iniciar sesión. Intenta nuevamente.');
      }
    });
  }

  agregarDigito(digito: string): void {
    if (this.cedula.length < 15) this.cedula += digito;
    this.error.set(null);
  }

  borrarDigito(): void {
    this.cedula = this.cedula.slice(0, -1);
    this.error.set(null);
  }

  limpiar(): void {
    this.cedula = '';
    this.error.set(null);
    this.autenticado.set(false);
  }

  salir(): void {
    this.authService.logout();
    this.cedula = '';
    this.error.set(null);
    this.cargando.set(false);
    this.autenticado.set(false);
  }

  irA(ruta: '/agendar' | '/mis-turnos'): void {
    this.router.navigate([ruta]);
  }
}
