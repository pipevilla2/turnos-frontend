import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TurnoService } from '../../core/services/turno.service';
import { Turno } from '../../core/models/turno.model';

@Component({
  selector: 'app-turno-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './turno-detalle.component.html'
})
export class TurnoDetalleComponent implements OnInit, OnDestroy {
  turno = signal<Turno | null>(null);
  error = signal<string | null>(null);
  activando = signal(false);
  segundosRestantes = signal(0);
  private cronometro?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private turnoService: TurnoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.turnoService.obtenerPorId(id).subscribe({
      next: t => {
        this.turno.set(t);
        this.iniciarCronometro(t);
      },
      error: () => this.error.set('No fue posible cargar el turno.')
    });
  }

  ngOnDestroy(): void {
    this.cronometro?.unsubscribe();
  }

  activar(): void {
    const t = this.turno();
    if (!t) return;
    this.activando.set(true);
    this.turnoService.activar(t.id).subscribe({
      next: actualizado => {
        this.activando.set(false);
        this.turno.set(actualizado);
        this.cronometro?.unsubscribe();
      },
      error: err => {
        this.activando.set(false);
        this.error.set(err?.error?.detalle ?? 'No fue posible activar el turno.');
      }
    });
  }

  salir(): void {
    this.cronometro?.unsubscribe();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatoTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60).toString().padStart(2, '0');
    const segundosRestantes = (segundos % 60).toString().padStart(2, '0');
    return `${minutos}:${segundosRestantes}`;
  }

  private iniciarCronometro(turno: Turno): void {
    this.cronometro?.unsubscribe();

    if (turno.estado !== 'Pendiente') {
      this.segundosRestantes.set(0);
      return;
    }

    let restante = Math.max(0, turno.segundosRestantesActivacion);

    const actualizar = () => {
      this.segundosRestantes.set(Math.max(0, restante));
      if (restante <= 0) this.cronometro?.unsubscribe();
      restante -= 1;
    };

    actualizar();
    this.cronometro = interval(1000).subscribe(actualizar);
  }
}
