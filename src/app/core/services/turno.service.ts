import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearTurnoRequest, Turno } from '../models/turno.model';

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly baseUrl = `${environment.apiUrl}/turnos`;

  constructor(private http: HttpClient) {}

  crear(request: CrearTurnoRequest): Observable<Turno> {
    return this.http.post<Turno>(this.baseUrl, request);
  }

  obtenerTodos(filtros?: { cedula?: string; sucursalId?: number; estado?: string }): Observable<Turno[]> {
    let params = '';
    if (filtros) {
      const entries = Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '');
      if (entries.length) params = '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
    }
    return this.http.get<Turno[]>(`${this.baseUrl}${params}`);
  }

  obtenerPorId(id: string): Observable<Turno> {
    return this.http.get<Turno>(`${this.baseUrl}/${id}`);
  }

  activar(id: string): Observable<Turno> {
    return this.http.post<Turno>(`${this.baseUrl}/${id}/activar`, {});
  }

  actualizarEstado(id: string, estado: 'Atendido' | 'Cancelado'): Observable<Turno> {
    return this.http.put<Turno>(`${this.baseUrl}/${id}`, { estado });
  }
}
