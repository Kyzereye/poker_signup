import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';

export interface UserWithRoles {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <div class="page-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, roles, and system settings</p>
        </div>

        <div class="admin-content">
          <mat-card class="admin-card">
            <mat-card-header>
              <mat-card-title>User Management</mat-card-title>
              <mat-card-subtitle>View and manage user accounts and roles</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="admin-stats">
                <div class="stat-item">
                  <mat-icon>people</mat-icon>
                  <div class="stat-content">
                    <span class="stat-label">Total Users</span>
                    <span class="stat-value">{{ totalUsers }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <div class="stat-content">
                    <span class="stat-label">Admin Users</span>
                    <span class="stat-value">{{ adminUsers }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon>casino</mat-icon>
                  <div class="stat-content">
                    <span class="stat-label">Dealers</span>
                    <span class="stat-value">{{ dealerUsers }}</span>
                  </div>
                </div>
                <div class="stat-item">
                  <mat-icon>sports_esports</mat-icon>
                  <div class="stat-content">
                    <span class="stat-label">Players</span>
                    <span class="stat-value">{{ playerUsers }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="admin-card">
            <mat-card-header>
              <mat-card-title>System Information</mat-card-title>
              <mat-card-subtitle>Current system status and configuration</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="system-info">
                <div class="info-item">
                  <mat-icon>security</mat-icon>
                  <span>Role-based access control is active</span>
                </div>
                <div class="info-item">
                  <mat-icon>check_circle</mat-icon>
                  <span>Database connection is healthy</span>
                </div>
                <div class="info-item">
                  <mat-icon>schedule</mat-icon>
                  <span>Last updated: {{ lastUpdated | date:'short' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="admin-card">
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
              <mat-card-subtitle>Common administrative tasks</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="refreshData()">
                  <mat-icon>refresh</mat-icon>
                  Refresh Data
                </button>
                <button mat-raised-button color="accent" (click)="viewUsers()">
                  <mat-icon>people</mat-icon>
                  View All Users
                </button>
                <button mat-raised-button color="warn" (click)="systemSettings()">
                  <mat-icon>settings</mat-icon>
                  System Settings
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      background: var(--background-secondary);
      z-index: 1000;
      padding: 2rem;
      overflow-y: auto;
    }

    .content-wrapper {
      width: 100%;
      max-width: 1200px;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h1 {
        color: var(--text-primary);
        font-size: 2.5rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
        background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      p {
        color: var(--text-secondary);
        font-size: 1.1rem;
        margin: 0;
        max-width: 600px;
        margin: 0 auto;
      }
    }

    .admin-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .admin-card {
      background: var(--background-primary);
      border-radius: var(--border-radius-large);
      box-shadow: var(--shadow-medium);
      border: 1px solid var(--border-light);
      
      mat-card-header {
        background: var(--background-tertiary);
        border-bottom: 1px solid var(--border-light);
        
        mat-card-title {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        
        mat-card-subtitle {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0.5rem 0 0 0;
        }
      }
      
      mat-card-content {
        padding: 1.5rem;
      }
    }

    .admin-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--background-secondary);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-light);
        
        mat-icon {
          font-size: 2rem;
          color: var(--primary-color);
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
          
          .stat-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }
          
          .stat-value {
            color: var(--text-primary);
            font-size: 1.5rem;
            font-weight: 600;
          }
        }
      }
    }

    .system-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--background-secondary);
        border-radius: var(--border-radius);
        
        mat-icon {
          color: var(--success-color);
          font-size: 1.25rem;
        }
        
        span {
          color: var(--text-primary);
          font-size: 0.9rem;
        }
      }
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      
      button {
        flex: 1;
        min-width: 150px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        
        mat-icon {
          margin-right: 0.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      
      .admin-content {
        grid-template-columns: 1fr;
      }
      
      .admin-stats {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
        
        button {
          min-width: auto;
        }
      }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  totalUsers = 0;
  adminUsers = 0;
  dealerUsers = 0;
  playerUsers = 0;
  lastUpdated = new Date();

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAdminData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminData() {
    // This would typically load real data from the backend
    // For now, we'll simulate some data
    this.totalUsers = 25;
    this.adminUsers = 3;
    this.dealerUsers = 5;
    this.playerUsers = 17;
    this.lastUpdated = new Date();
  }

  refreshData() {
    this.loadAdminData();
    this.snackBar.open('Data refreshed successfully!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  viewUsers() {
    this.snackBar.open('User management feature coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  systemSettings() {
    this.snackBar.open('System settings feature coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
