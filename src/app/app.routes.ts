import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'agendar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/agendar-turno/agendar-turno.component').then(m => m.AgendarTurnoComponent)
  },
  {
    path: 'mis-turnos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/lista-turnos/lista-turnos.component').then(m => m.ListaTurnosComponent)
  },
  {
    path: 'turnos/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/turno-detalle/turno-detalle.component').then(m => m.TurnoDetalleComponent)
  },
  { path: '**', redirectTo: 'login' }
];
