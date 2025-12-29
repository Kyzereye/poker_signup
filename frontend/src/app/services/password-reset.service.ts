import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  /**
   * Request password reset email
   * @param email User email address
   */
  requestPasswordReset(email: string): Observable<any> {
    return this.httpClient.post(`${this.url}/api/auth/forgot-password`, { email });
  }

  /**
   * Reset password with token
   * @param token Password reset token
   * @param newPassword New password
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.httpClient.post(`${this.url}/api/auth/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Verify reset token validity
   * @param token Password reset token
   */
  verifyToken(token: string): Observable<any> {
    return this.httpClient.get(`${this.url}/api/auth/verify-reset-token/${token}`);
  }
}

