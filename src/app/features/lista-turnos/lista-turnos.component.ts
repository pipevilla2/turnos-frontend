import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TurnoService } from '../../core/services/turno.service';
import { AuthService } from '../../core/services/auth.service';
import { Turno } from '../../core/models/turno.model';

@Component({
  selector: 'app-lista-turnos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-turnos.component.html'
})
export class ListaTurnosComponent implements OnInit {
  get authServiceCedula(): string | null {
    return this.authService.cedulaActual;
  }

  turnos = signal<Turno[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  constructor(
    private turnoService: TurnoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    const cedula = this.authService.cedulaActual ?? undefined;

    this.turnoService.obtenerTodos({ cedula }).subscribe({
      next: turnos => {
        this.cargando.set(false);
        this.turnos.set(turnos);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No fue posible cargar tus turnos.');
      }
    });
  }

  salir(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
