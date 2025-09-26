import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminService, UserStats, AdminDashboardData } from '@services/admin.service';
import { RoleService } from '@services/role.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  userStats: UserStats = {
    totalUsers: 0,
    adminUsers: 0,
    dealerUsers: 0,
    playerUsers: 0
  };
  
  
  systemInfo: any = {
    databaseStatus: 'Unknown',
    totalGames: 0,
    activeSignups: 0
  };
  
  isLoading = true;
  lastUpdated = new Date();

  constructor(
    private roleService: RoleService,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAdminData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminData() {
    this.isLoading = true;
    
    this.adminService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AdminDashboardData) => {
          this.userStats = data.userStats;
          this.systemInfo = data.systemInfo;
          this.lastUpdated = new Date();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading admin data:', error);
          this.snackBar.open('Error loading admin data', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  refreshData() {
    this.loadAdminData();
    this.snackBar.open('Data refreshed', 'Close', { duration: 2000 });
  }

  viewUsers() {
    this.snackBar.open('View Users functionality coming soon', 'Close', { duration: 2000 });
  }

  systemSettings() {
    this.snackBar.open('System Settings functionality coming soon', 'Close', { duration: 2000 });
  }

  manageLocationsGames() {
    this.router.navigate(['/admin/venue-game-management']);
  }

  manageUsers() {
    this.router.navigate(['/admin/user-management']);
  }

  manageRoles() {
    this.router.navigate(['/admin/role-management']);
  }

}