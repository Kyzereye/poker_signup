import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

// Define interfaces locally
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

import { UserDialogComponent, UserDialogData } from './user-dialog/user-dialog.component';
import { DeleteConfirmationDialogComponent, DeleteConfirmationData } from './delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: User[] = [];
  filteredUsers: User[] = [];
  
  usersLoading = false;
  
  userSearchTerm = '';
  userSort: Sort = { active: 'username', direction: 'asc' };

  userColumns: string[] = ['username', 'email', 'first_name', 'last_name', 'role', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.usersLoading = true;
    const url = `${environment.apiUrl}/api/admin/all_users`;
    
    this.http.get<User[]>(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.filteredUsers = [...users];
          this.applyUserFilters();
          this.usersLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
          this.usersLoading = false;
        }
      });
  }

  addUser() {
    const dialogData: UserDialogData = {
      mode: 'add'
    };

    const dialogRef = this.dialog.open(UserDialogComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadUsers(); // Refresh the users list
      }
    });
  }

  editUser(user: User) {
    const dialogData: UserDialogData = {
      mode: 'edit',
      user: user
    };

    const dialogRef = this.dialog.open(UserDialogComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadUsers(); // Refresh the users list
      }
    });
  }

  deleteUser(user: User) {
    const dialogData: DeleteConfirmationData = {
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      itemName: user.username,
      itemType: 'User',
      isDeleting: false
    };

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: dialogData,
      width: '450px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.performDeleteUser(user);
      }
    });
  }

  private performDeleteUser(user: User): void {
    const url = `${environment.apiUrl}/api/admin/delete_user/${user.id}`;
    
    this.http.delete(url).subscribe({
      next: (response: any) => {
        this.snackBar.open('User deleted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.loadUsers(); // Refresh the users list
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
        let errorMessage = 'Failed to delete user. Please try again.';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  // Search and filter methods
  onUserSearchChange(searchTerm: string): void {
    this.userSearchTerm = searchTerm;
    this.applyUserFilters();
  }

  onUserSortChange(sort: Sort): void {
    // If clicking the same column, toggle between asc and desc
    if (this.userSort.active === sort.active) {
      if (this.userSort.direction === 'asc') {
        this.userSort = { active: sort.active, direction: 'desc' };
      } else {
        this.userSort = { active: sort.active, direction: 'asc' };
      }
    } else {
      // New column, start with ascending
      this.userSort = { active: sort.active, direction: 'asc' };
    }
    this.applyUserFilters();
  }

  applyUserFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.userSearchTerm.trim()) {
      const searchLower = this.userSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const isAsc = this.userSort.direction === 'asc';
      let valueA: any, valueB: any;

      switch (this.userSort.active) {
        case 'username':
          valueA = a.username;
          valueB = b.username;
          break;
        case 'email':
          valueA = a.email;
          valueB = b.email;
          break;
        case 'first_name':
          valueA = a.first_name;
          valueB = b.first_name;
          break;
        case 'last_name':
          valueA = a.last_name;
          valueB = b.last_name;
          break;
        case 'role':
          valueA = a.role;
          valueB = b.role;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return isAsc ? -1 : 1;
      }
      if (valueA > valueB) {
        return isAsc ? 1 : -1;
      }
      return 0;
    });

    this.filteredUsers = filtered;
  }
}
