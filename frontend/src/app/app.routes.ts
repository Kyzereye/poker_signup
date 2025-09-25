import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { StandingsComponent } from './pages/standings/standings.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { SignupComponent } from './pages/signup/signup.component';
import { TheListComponent } from './pages/the-list/the-list.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { ResendVerificationComponent } from './pages/resend-verification/resend-verification.component';
import { AdminComponent } from './pages/admin/admin.component';
import { VenueGameManagementComponent } from './pages/admin/venue-game-management/venue-game-management.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Non-authenticated routes
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'verify-email',
    component: EmailVerificationComponent
  },
  {
    path: 'resend-verification',
    component: ResendVerificationComponent
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
        component: DashboardComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'standings',
        component: StandingsComponent
      },
      {
        path: 'the-list',
        component: TheListComponent
      },
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AdminGuard]
      },
      {
        path: 'admin/venue-game-management',
        component: VenueGameManagementComponent,
        canActivate: [AdminGuard]
      },
      {
        path: 'admin/user-management',
        component: UserManagementComponent,
        canActivate: [AdminGuard]
      }
    ]
  },
  {
    path: '**',
    component: NotfoundComponent
  }
];

