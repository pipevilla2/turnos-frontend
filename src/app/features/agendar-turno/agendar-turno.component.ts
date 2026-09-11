import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { TurnoService } from '../../core/services/turno.service';
import { SucursalService } from '../../core/services/sucursal.service';
import { AuthService } from '../../core/services/auth.service';
import { Sucursal } from '../../core/models/sucursal.model';
import { Turno } from '../../core/models/turno.model';

@Component({
  selector: 'app-agendar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agendar-turno.component.html'
})
export class AgendarTurnoComponent implements OnInit, OnDestroy {
  get authServiceCedula(): string | null {
    return this.authService.cedulaActual;
  }
  sucursales = signal<Sucursal[]>([]);
  sucursalSeleccionada: number | null = null;
  turnoCreado = signal<Turno | null>(null);
  segundosRestantes = signal(0);
  cargando = signal(false);
  activando = signal(false);
  error = signal<string | null>(null);

  private cronometro?: Subscription;

  constructor(
    private sucursalService: SucursalService,
    private turnoService: TurnoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sucursalService.obtenerTodas().subscribe(s => this.sucursales.set(s.filter(x => x.activa)));
  }

  ngOnDestroy(): void {
    this.cronometro?.unsubscribe();
  }

  agendar(): void {
    this.error.set(null);
    const cedula = this.authService.cedulaActual;

    if (!cedula || !this.sucursalSeleccionada) {
      this.error.set('Selecciona una sucursal para continuar.');
      return;
    }

    this.cargando.set(true);
    this.turnoService.crear({ cedula, sucursalId: this.sucursalSeleccionada }).subscribe({
      next: turno => {
        this.cargando.set(false);
        this.turnoCreado.set(turno);
        this.iniciarCronometro(turno.segundosRestantesActivacion);
      },
      error: err => {
        this.cargando.set(false);
        this.error.set(err?.error?.detalle ?? 'No fue posible agendar el turno.');
      }
    });
  }

  activarTurno(): void {
    const turno = this.turnoCreado();
    if (!turno) return;

    this.activando.set(true);
    this.turnoService.activar(turno.id).subscribe({
      next: actualizado => {
        this.activando.set(false);
        this.turnoCreado.set(actualizado);
        this.cronometro?.unsubscribe();
      },
      error: err => {
        this.activando.set(false);
        this.error.set(err?.error?.detalle ?? 'No fue posible activar el turno. Es posible que haya expirado.');
      }
    });
  }

  nuevoTurno(): void {
    this.turnoCreado.set(null);
    this.error.set(null);
    this.cronometro?.unsubscribe();
  }

  irAMisTurnos(): void {
    this.router.navigate(['/mis-turnos']);
  }

  private iniciarCronometro(segundosIniciales: number): void {
    this.segundosRestantes.set(segundosIniciales);
    this.cronometro?.unsubscribe();
    this.cronometro = interval(1000).subscribe(() => {
      const restante = this.segundosRestantes() - 1;
      this.segundosRestantes.set(Math.max(0, restante));
      if (restante <= 0) this.cronometro?.unsubscribe();
    });
  }

  formatoTiempo(segundos: number): string {
    const m = Math.floor(segundos / 60).toString().padStart(2, '0');
    const s = Math.floor(segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
