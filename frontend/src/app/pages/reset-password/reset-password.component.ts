import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PasswordResetService } from '../../services/password-reset.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  isValidatingToken = true;
  tokenValid = false;
  token = '';
  email = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private passwordResetService: PasswordResetService,
    private snackBar: MatSnackBar
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get token from URL parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      
      if (!this.token) {
        this.showError('Invalid reset link. No token provided.');
        return;
      }

      this.validateToken();
    });
  }

  private validateToken(): void {
    this.isValidatingToken = true;

    this.passwordResetService.verifyResetToken(this.token).subscribe({
      next: (response) => {
        this.isValidatingToken = false;
        if (response.success) {
          this.tokenValid = true;
          this.email = response.email;
        } else {
          this.showError('Invalid or expired reset link.');
        }
      },
      error: (error) => {
        this.isValidatingToken = false;
        console.error('Token validation error:', error);
        this.showError('Invalid or expired reset link.');
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { newPassword } = this.resetForm.value;

      this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(
            'Password has been reset successfully! You can now log in with your new password.',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Password reset error:', error);
          this.snackBar.open(
            error.error?.error || 'Failed to reset password. Please try again.',
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
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.router.navigate(['/login']);
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    
    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.resetForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Password must be at least ${requiredLength} characters long`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
