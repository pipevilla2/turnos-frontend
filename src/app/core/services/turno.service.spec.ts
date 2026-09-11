import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TurnoService } from './turno.service';
import { environment } from '../../../environments/environment';
import { Turno } from '../models/turno.model';

describe('TurnoService', () => {
  let service: TurnoService;
  let httpMock: HttpTestingController;

  const turnoEjemplo: Turno = {
    id: '11111111-1111-1111-1111-111111111111',
    codigoTurno: 'S01-240101-001',
    cedula: '123456',
    sucursalId: 1,
    sucursalNombre: 'Centro',
    fechaHoraCreacion: new Date().toISOString(),
    fechaHoraExpiracion: new Date().toISOString(),
    fechaHoraActivacion: null,
    estado: 'Pendiente',
    segundosRestantesActivacion: 900
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TurnoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería crear un turno vía POST /turnos', () => {
    service.crear({ cedula: '123456', sucursalId: 1 }).subscribe(turno => {
      expect(turno.codigoTurno).toBe('S01-240101-001');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/turnos`);
    expect(req.request.method).toBe('POST');
    req.flush(turnoEjemplo);
  });

  it('debería activar un turno vía POST /turnos/{id}/activar', () => {
    service.activar(turnoEjemplo.id).subscribe(turno => {
      expect(turno.estado).toBe('Pendiente');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/turnos/${turnoEjemplo.id}/activar`);
    expect(req.request.method).toBe('POST');
    req.flush(turnoEjemplo);
  });

  it('debería listar turnos filtrando por cédula', () => {
    service.obtenerTodos({ cedula: '123456' }).subscribe(turnos => {
      expect(turnos.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/turnos?cedula=123456`);
    expect(req.request.method).toBe('GET');
    req.flush([turnoEjemplo]);
  });
});
