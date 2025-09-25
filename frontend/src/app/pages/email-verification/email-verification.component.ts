import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { VerificationService } from '../../services/verification.service';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss'
})
export class EmailVerificationComponent implements OnInit {
  verificationStatus: 'loading' | 'success' | 'error' | 'expired' = 'loading';
  errorMessage = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private verificationService: VerificationService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    
    if (!this.token) {
      this.verificationStatus = 'error';
      this.errorMessage = 'No verification token provided';
      return;
    }

    this.verifyEmail();
  }

  verifyEmail() {
    this.verificationService.verifyEmail(this.token).subscribe({
      next: (response) => {
        if (response.success) {
          this.verificationStatus = 'success';
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.verificationStatus = 'error';
          this.errorMessage = response.error || 'Verification failed';
        }
      },
      error: (error) => {
        console.error('Verification error:', error);
        if (error.error?.error?.includes('expired')) {
          this.verificationStatus = 'expired';
        } else {
          this.verificationStatus = 'error';
          this.errorMessage = error.error?.error || 'Verification failed';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}