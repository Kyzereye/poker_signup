// frontend/login.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { UserService } from '../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent } from '../components/simple-dialog/simple-dialog.component';
import { VerificationService } from '../services/verification.service';
import { PasswordResetDialogComponent } from '../components/password-reset-dialog/password-reset-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  login_form!: FormGroup;
  locations: any[] = [];
  users: any[] = [];
  hide_password: boolean = true;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private verificationService: VerificationService
  ) { }

  ngOnInit(): void {
    this.login_form = this.fb.group({
      email: ['kyzereye@gmail.com', Validators.required],
      password: ['1qazZAQ!']
    });
  }

onSubmit() {
    let form_data = this.login_form.value;
    const data = {
      email: form_data.email,
      password: form_data.password
    }
  
    this.loginService.login(data).subscribe((response: any) => {
      if (response.success === true) {
        this.userService.setCurrentUser(response.user_data);
        this.authService.login(response.user_data);
        this.router.navigate(['/signup']);
      }
    }, (error) => {
      console.error("Login error:", error);
      this.handleLoginError(error, form_data.email);
    });
}

private handleLoginError(error: any, email: string): void {
  // Check if the error is due to unverified email
  if (error.status === 403 && error.error?.requires_verification) {
    this.showVerificationRequiredDialog(email);
  } else {
    this.showLoginError();
  }
}

private showLoginError(): void {
  // Generic error message for security - don't reveal if email exists or password is wrong
  const errorMessage = 'Login credentials are incorrect. Please check your email and password and try again.';

  this.dialog.open(SimpleDialogComponent, {
    width: '400px',
    data: {
      title: 'Login Failed',
      message: errorMessage,
      confirmText: 'OK',
      cancelText: null
    }
  });
}

private showVerificationRequiredDialog(email: string): void {
  this.dialog.open(SimpleDialogComponent, {
    width: '450px',
    data: {
      title: 'Email Verification Required',
      message: 'Please verify your email address before logging in. Check your email for a verification link.',
      confirmText: 'Resend Verification Email',
      cancelText: 'Cancel',
      showResendButton: true
    }
  }).afterClosed().subscribe(result => {
    if (result === 'resend') {
      this.resendVerificationEmail(email);
    }
  });
}

private resendVerificationEmail(email: string): void {
  this.verificationService.resendVerificationEmail(email).subscribe({
    next: (response) => {
      if (response.success) {
        this.dialog.open(SimpleDialogComponent, {
          width: '400px',
          data: {
            title: 'Email Sent',
            message: 'If the email address exists and is unverified, a new verification email has been sent.',
            confirmText: 'OK',
            cancelText: null
          }
        });
      }
    },
    error: (error) => {
      console.error('Resend verification error:', error);
      this.dialog.open(SimpleDialogComponent, {
        width: '400px',
        data: {
          title: 'Error',
          message: 'Failed to send verification email. Please try again.',
          confirmText: 'OK',
          cancelText: null
        }
      });
    }
  });
}

  getLocations() {
    this.userService.getAllLocations().subscribe({
      next: (data: any) => {
        this.locations = data
        this.userService.setLocations(this.locations)
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }
  getAllusers() {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      }
    });
  }

      onForgotPassword() {
        const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
          width: '500px',
          data: { mode: 'password-reset' }
        });

        dialogRef.afterClosed().subscribe(result => {
          // Dialog closed, no action needed
        });
      }

  goToRegister() {
    this.router.navigate(['/register']);
  }


}
