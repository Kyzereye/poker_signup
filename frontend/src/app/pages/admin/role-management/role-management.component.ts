import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService, Role } from '@services/admin.service';
import { RoleDialogComponent } from './role-dialog/role-dialog.component';
import { DeleteConfirmationDialogComponent } from '../user-management/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  providers: [AdminService, MatDialog, MatSnackBar],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  displayedColumns: string[] = ['name', 'description', 'user_count', 'actions'];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.adminService.getAllRoles().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
        this.snackBar.open('Error loading roles', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  openAddRoleDialog(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
        this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditRoleDialog(role: Role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '500px',
      data: { mode: 'edit', role: role }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
        this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openDeleteRoleDialog(role: Role): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Role',
        message: `Are you sure you want to delete the role "${role.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        itemName: role.name,
        userCount: role.user_count
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteRole(role.id);
      }
    });
  }

  private deleteRole(roleId: number): void {
    this.adminService.deleteRole(roleId).subscribe({
      next: (response: any) => {
        this.loadRoles();
        this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error deleting role:', error);
        let errorMessage = 'Error deleting role';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

}