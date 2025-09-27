import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { USER_ROLES } from '@shared/constants';

export interface UserDialogData {
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  mode: 'add' | 'edit';
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  roles: readonly string[] = USER_ROLES;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', this.data.mode === 'add' ? [Validators.required, Validators.minLength(6)] : []],
      role: ['player', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.userForm.patchValue(this.data.user);
      // Don't populate password field for edit mode
      this.userForm.get('password')?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formData = this.userForm.value;
      
      // Remove password field if it's empty in edit mode
      if (this.data.mode === 'edit' && !formData.password) {
        delete formData.password;
      }
      
      if (this.data.mode === 'add') {
        this.addUser(formData);
      } else {
        this.editUser(formData);
      }
    }
  }

  private addUser(userData: any): void {
    const url = `${environment.apiUrl}/api/admin/create_user`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.post(url, userData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('User created successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error creating user:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to create user. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  private editUser(userData: any): void {
    if (!this.data.user?.id) return;

    const url = `${environment.apiUrl}/api/admin/update_user/${this.data.user.id}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.put(url, userData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('User updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true, data: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating user:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to update user. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        );
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.replace('_', ' ')} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.replace('_', ' ')} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }
}
