import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  constructor(
    private userService: UserService,
    private roleService: RoleService
  ) {}

  isAuthenticated(): boolean {
    return this.authenticated.value;
  }

  getCurrentUser() {
    return this.currentUser.asObservable();
  }

  login(userData: any): void {
    this.authenticated.next(true);
    this.currentUser.next(userData);
    
    // Set user role
    if (userData.role) {
      this.roleService.setCurrentUserRole(userData.role);
    }
  }

  logout(): void {
    this.authenticated.next(false);
    this.currentUser.next(null);
    this.roleService.clearRole();
  }
}
