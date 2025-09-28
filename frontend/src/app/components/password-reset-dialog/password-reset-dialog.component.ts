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
import { PasswordResetService } from '../../services/password-reset.service';

export interface PasswordResetDialogData {
  mode: 'password-reset';
}

@Component({
  selector: 'app-password-reset-dialog',
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
  templateUrl: './password-reset-dialog.component.html',
  styleUrl: './password-reset-dialog.component.scss'
})
export class PasswordResetDialogComponent implements OnInit {
  passwordResetForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PasswordResetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordResetDialogData
  ) {
    this.passwordResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Form is ready to use
  }

  onPasswordResetSubmit(): void {
    if (this.passwordResetForm.valid && !this.isLoading) {
      this.isLoading = true;
      const email = this.passwordResetForm.value.email;

      this.passwordResetService.requestPasswordReset(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(response.message, 'Close', { duration: 5000 });
          this.dialogRef.close({ success: true });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Password reset request error:', error);
          this.snackBar.open(error.error?.error || 'Failed to request password reset. Please try again.', 'Close', { duration: 5000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}