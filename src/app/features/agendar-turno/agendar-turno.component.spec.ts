import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AgendarTurnoComponent } from './agendar-turno.component';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

describe('AgendarTurnoComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendarTurnoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería cargar la lista de sucursales activas al iniciar', () => {
    const fixture = TestBed.createComponent(AgendarTurnoComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/sucursales`);
    req.flush([
      { id: 1, nombre: 'Centro', direccion: 'Cra 1', ciudad: 'Medellín', activa: true },
      { id: 2, nombre: 'Inactiva', direccion: 'Cra 2', ciudad: 'Medellín', activa: false }
    ]);

    expect(fixture.componentInstance.sucursales().length).toBe(1);
  });

  it('debería mostrar error si se agenda sin seleccionar sucursal', () => {
    const fixture = TestBed.createComponent(AgendarTurnoComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/sucursales`).flush([]);

    const authService = TestBed.inject(AuthService);
    spyOnProperty(authService, 'cedulaActual', 'get').and.returnValue('123456');

    fixture.componentInstance.sucursalSeleccionada = null;
    fixture.componentInstance.agendar();

    expect(fixture.componentInstance.error()).toBeTruthy();
  });

  it('formatoTiempo debería dar formato mm:ss', () => {
    const fixture = TestBed.createComponent(AgendarTurnoComponent);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiUrl}/sucursales`).flush([]);
    expect(fixture.componentInstance.formatoTiempo(65)).toBe('01:05');
  });
});
