import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TurnoService } from '../../core/services/turno.service';
import { Turno } from '../../core/models/turno.model';

@Component({
  selector: 'app-turno-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './turno-detalle.component.html'
})
export class TurnoDetalleComponent implements OnInit {
  turno = signal<Turno | null>(null);
  error = signal<string | null>(null);
  activando = signal(false);

  constructor(private route: ActivatedRoute, private turnoService: TurnoService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.turnoService.obtenerPorId(id).subscribe({
      next: t => this.turno.set(t),
      error: () => this.error.set('No fue posible cargar el turno.')
    });
  }

  activar(): void {
    const t = this.turno();
    if (!t) return;
    this.activando.set(true);
    this.turnoService.activar(t.id).subscribe({
      next: actualizado => {
        this.activando.set(false);
        this.turno.set(actualizado);
      },
      error: err => {
        this.activando.set(false);
        this.error.set(err?.error?.detalle ?? 'No fue posible activar el turno.');
      }
    });
  }
}
