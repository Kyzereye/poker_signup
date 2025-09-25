import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { VerificationService } from '../../services/verification.service';

@Component({
  selector: 'app-resend-verification',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './resend-verification.component.html',
  styleUrl: './resend-verification.component.scss'
})
export class ResendVerificationComponent {
  resendForm: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private verificationService: VerificationService,
    private snackBar: MatSnackBar
  ) {
    this.resendForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resendForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const email = this.resendForm.get('email')?.value;

      this.verificationService.resendVerificationEmail(email).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.showSuccessMessage('If the email address exists and is unverified, a new verification email has been sent');
            // Redirect to login after showing success message
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Resend verification error:', error);
          this.showErrorMessage('Failed to send verification email. Please try again.');
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}