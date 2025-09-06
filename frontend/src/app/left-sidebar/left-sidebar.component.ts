import { CommonModule } from '@angular/common';
import { Component, input, output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service'; // You'll need to create this service


@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent {
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();
  
  authService = inject(AuthService);

    constructor(
      private router: Router
    ) { }

  get items() {
    return this.authService.isAuthenticated() ? this.authenticatedItems : this.nonAuthenticatedItems;
  }

  private authenticatedItems = [
    {
      routeLink: 'dashboard',
      icon: 'fal fa-home',
      label: 'Dashboard',
    },
    {
      routeLink: 'signup',
      icon: 'fal fa-cog',
      label: 'Signup for Game',
    },
    {
      routeLink: 'standings',
      icon: 'fal fa-file',
      label: 'Standings',
    },
    {
      routeLink: 'profile',
      icon: 'fal fa-box-open',
      label: 'Profile',
    },
  ];

  private nonAuthenticatedItems = [
    {
      routeLink: 'login',
      icon: 'fal fa-sign-in',
      label: 'Login',
    },
    {
      routeLink: 'register',
      icon: 'fal fa-user-plus',
      label: 'Register',
    },
  ];

  toggleCollapse(): void {
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }

  closeSidenav(): void {
    this.changeIsLeftSidebarCollapsed.emit(true);
  }
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
