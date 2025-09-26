import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService, Role } from '@services/admin.service';

export interface RoleDialogData {
  mode: 'add' | 'edit';
  role?: Role;
}

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  providers: [AdminService, MatSnackBar],
  templateUrl: './role-dialog.component.html',
  styleUrls: ['./role-dialog.component.scss']
})
export class RoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.role) {
      this.roleForm.patchValue({
        name: this.data.role.name,
        description: this.data.role.description || ''
      });
    }
  }

  onSubmit(): void {
    if (this.roleForm.valid && !this.loading) {
      this.loading = true;
      const formData = this.roleForm.value;

      if (this.isEditMode && this.data.role) {
        this.updateRole(this.data.role.id, formData);
      } else {
        this.createRole(formData);
      }
    }
  }

  private createRole(roleData: { name: string; description: string }): void {
    this.adminService.createRole(roleData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error creating role:', error);
        let errorMessage = 'Error creating role';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  private updateRole(roleId: number, roleData: { name: string; description: string }): void {
    this.adminService.updateRole(roleId, roleData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error updating role:', error);
        let errorMessage = 'Error updating role';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.roleForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('pattern')) {
      return 'Role name can only contain letters, numbers, and underscores';
    }
    return '';
  }
}