import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenResponse {
  token: string;
  rol: 'Cliente' | 'Empleado';
  expiraUtc: string;
}

const STORAGE_KEY = 'amaris_turnos_session';

/**
 * Maneja la sesión del usuario (cliente identificado por cédula, o empleado
 * de sucursal). El token JWT se guarda en localStorage para persistir la
 * sesión entre recargas, y se expone vía signals para reactividad en la UI.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private sesion = signal<TokenResponse | null>(this.leerSesionGuardada());

  readonly estaAutenticado = computed(() => !!this.sesion());
  readonly rol = computed(() => this.sesion()?.rol ?? null);
  readonly token = computed(() => this.sesion()?.token ?? null);

  constructor(private http: HttpClient) {}

  loginCliente(cedula: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.apiUrl}/auth/token-cliente`, { cedula })
      .pipe(tap(res => this.guardarSesion(res, cedula)));
  }

  loginEmpleado(usuario: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${environment.apiUrl}/auth/login`, { usuario, password })
      .pipe(tap(res => this.guardarSesion(res)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sesion.set(null);
  }

  get cedulaActual(): string | null {
    return localStorage.getItem(`${STORAGE_KEY}_cedula`);
  }

  private guardarSesion(res: TokenResponse, cedula?: string): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    if (cedula) localStorage.setItem(`${STORAGE_KEY}_cedula`, cedula);
    this.sesion.set(res);
  }

  private leerSesionGuardada(): TokenResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed: TokenResponse = JSON.parse(raw);
      if (new Date(parsed.expiraUtc) < new Date()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
