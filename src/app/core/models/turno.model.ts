export type EstadoTurno = 'Pendiente' | 'Activado' | 'Atendido' | 'Expirado' | 'Cancelado';

export interface Turno {
  id: string;
  codigoTurno: string;
  cedula: string;
  sucursalId: number;
  sucursalNombre: string;
  fechaHoraCreacion: string;
  fechaHoraExpiracion: string;
  fechaHoraActivacion: string | null;
  estado: EstadoTurno;
  segundosRestantesActivacion: number;
}

export interface CrearTurnoRequest {
  cedula: string;
  sucursalId: number;
}
