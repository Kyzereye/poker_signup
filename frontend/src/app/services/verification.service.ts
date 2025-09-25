import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  // Verify email with token
  verifyEmail(token: string): Observable<any> {
    return this.httpClient.get(this.url + `/api/auth/verify-email/${token}`, {
      headers: new HttpHeaders().set("Content-Type", "application/json")
    });
  }

  // Resend verification email
  resendVerificationEmail(email: string): Observable<any> {
    return this.httpClient.post(this.url + "/api/auth/resend-verification", 
      { email: email }, 
      {
        headers: new HttpHeaders().set("Content-Type", "application/json")
      }
    );
  }

  // Check verification status
  checkVerificationStatus(email: string): Observable<any> {
    return this.httpClient.post(this.url + "/api/auth/check-verification-status", 
      { email: email }, 
      {
        headers: new HttpHeaders().set("Content-Type", "application/json")
      }
    );
  }
}
