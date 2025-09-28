import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

export interface ChangePasswordDialogData {
  userId: number;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.scss'
})
export class ChangePasswordDialogComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Form is ready to use
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formData = this.passwordForm.value;

      const passwordData = {
        userId: this.data.userId,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      this.changePassword(passwordData);
    }
  }

  private changePassword(passwordData: any): void {
    const url = `${environment.apiUrl}/api/users/change-password`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    this.http.post(url, passwordData, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.dialogRef.close({ success: true });
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error changing password:', error);
        this.snackBar.open(
          error.error?.error || 'Failed to change password. Please check your current password and try again.',
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

  getErrorMessage(controlName: string): string {
    const control = this.passwordForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['minlength']) {
        return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['mismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
