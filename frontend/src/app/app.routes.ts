import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; // You'll need to create this guard

export const routes: Routes = [
  // Non-authenticated routes
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  // Authenticated routes
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'standings',
        loadComponent: () => import('./pages/standings/standings.component').then(m => m.StandingsComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/notfound/notfound.component').then(m => m.NotfoundComponent)
  }
];

