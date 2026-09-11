import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería autenticar al cliente y guardar la sesión', () => {
    expect(service.estaAutenticado()).toBeFalse();

    service.loginCliente('123456').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/token-cliente`);
    req.flush({ token: 'fake-jwt', rol: 'Cliente', expiraUtc: new Date(Date.now() + 60000).toISOString() });

    expect(service.estaAutenticado()).toBeTrue();
    expect(service.rol()).toBe('Cliente');
    expect(service.cedulaActual).toBe('123456');
  });

  it('logout debería limpiar la sesión', () => {
    service.loginCliente('123456').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/token-cliente`)
      .flush({ token: 'fake-jwt', rol: 'Cliente', expiraUtc: new Date(Date.now() + 60000).toISOString() });

    service.logout();
    expect(service.estaAutenticado()).toBeFalse();
  });
});
