import { CommonModule } from '@angular/common';
import { Component, input, output, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';

interface MenuItem {
  routeLink: string;
  icon: string;
  label: string;
  isAdmin?: boolean;
}


@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  isLeftSidebarCollapsed = input.required<boolean>();
  changeIsLeftSidebarCollapsed = output<boolean>();
  
  authService = inject(AuthService);
  roleService = inject(RoleService);
  
  isAdmin = false;
  isDealer = false;
  isPlayer = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    // Subscribe to role changes
    this.roleService.hasAdminRole()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAdmin => this.isAdmin = isAdmin);
      
    this.roleService.hasDealerRole()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDealer => this.isDealer = isDealer);
      
    this.roleService.hasPlayerRole()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isPlayer => this.isPlayer = isPlayer);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get items() {
    if (!this.authService.isAuthenticated()) {
      return this.nonAuthenticatedItems;
    }
    
    // Return items based on user roles
    let items = [...this.baseAuthenticatedItems];
    
    if (this.isAdmin) {
      items.push(...this.adminItems);
    }
    
    if (this.isDealer) {
      items.push(...this.dealerItems);
    }
    
    return items;
  }

  private baseAuthenticatedItems: MenuItem[] = [
    {
      routeLink: 'dashboard',
      icon: 'fal fa-home',
      label: 'Dashboard',
    },
    {
      routeLink: 'signup',
      icon: 'fal fa-calendar-plus',
      label: 'Signup for Game',
    },
    {
      routeLink: 'the-list',
      icon: 'fal fa-list',
      label: 'The List',
    },
    {
      routeLink: 'standings',
      icon: 'fal fa-trophy',
      label: 'Standings',
    },
    {
      routeLink: 'profile',
      icon: 'fal fa-user',
      label: 'Profile',
    },
  ];

  private adminItems: MenuItem[] = [
    {
      routeLink: 'admin',
      icon: 'fal fa-cog',
      label: 'Admin Panel'
    }
  ];

  private dealerItems: MenuItem[] = [
    // Future dealer-specific items can be added here
  ];

  private nonAuthenticatedItems: MenuItem[] = [
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
    // Navigation already handled in AuthService.logout()
  }
}
