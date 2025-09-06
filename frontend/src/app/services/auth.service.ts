import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = false;

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  login(): void {
    // Implement your login logic here
    this.authenticated = true;
  }

  logout(): void {
    // Implement your logout logic here
    this.authenticated = false;
  }
}
