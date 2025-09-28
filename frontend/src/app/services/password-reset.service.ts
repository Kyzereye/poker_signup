import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Request password reset email
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/request-password-reset`, 
      { email }, 
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }
    );
  }


  // Verify password reset token
  verifyResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/auth/verify-reset-token/${token}`, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/reset-password`, 
      { token, newPassword }, 
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }
    );
  }
}
