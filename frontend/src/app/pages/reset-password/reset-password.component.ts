import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule, MatSnackBarConfig } from '@angular/material/snack-bar';
import { PasswordResetService } from '../../services/password-reset.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  tokenValid = false;
  tokenChecked = false;
  token: string = '';

  passwordRequirements = {
    min_length: false,
    has_number: false,
    has_upper_case: false,
    has_lower_case: false,
    passwords_match: false,
    has_special_character: false,
  };

  allRequirementsMet = false;

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    if (!this.token) {
      this.showErrorMessage('Invalid reset link');
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
    this.verifyToken();
  }

  initForm() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    this.resetPasswordForm.valueChanges.subscribe(() => this.updatePasswordRequirements());
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  verifyToken() {
    this.passwordResetService.verifyToken(this.token).subscribe({
      next: (response: any) => {
        this.tokenChecked = true;
        this.tokenValid = response.valid;
        if (!response.valid) {
          this.showErrorMessage('Invalid or expired reset link. Please request a new one.');
        }
      },
      error: (error: any) => {
        this.tokenChecked = true;
        this.tokenValid = false;
        this.showErrorMessage('Invalid or expired reset link. Please request a new one.');
      }
    });
  }

  updatePasswordRequirements() {
    const newPassword = this.resetPasswordForm.get('password')?.value || '';
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value || '';
    
    this.passwordRequirements = {
      min_length: newPassword.length >= 8,
      has_number: /\d/.test(newPassword),
      has_upper_case: /[A-Z]/.test(newPassword),
      has_lower_case: /[a-z]/.test(newPassword),
      has_special_character: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword),
      passwords_match: newPassword === confirmPassword && newPassword !== '',
    };
    
    this.allRequirementsMet = Object.values(this.passwordRequirements).every(req => req);
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.allRequirementsMet && this.tokenValid) {
      this.isLoading = true;
      const newPassword = this.resetPasswordForm.get('password')?.value;

      this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.showSuccessMessage('Password has been reset successfully. Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          const errorMessage = error.error?.error || 'An error occurred resetting your password';
          this.showErrorMessage(errorMessage);
        }
      });
    }
  }

  showSuccessMessage(message: string) {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    };
    this.snackBar.open(message, '', config);
  }

  showErrorMessage(message: string) {
    const config: MatSnackBarConfig = {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    };
    this.snackBar.open(message, '', config);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

