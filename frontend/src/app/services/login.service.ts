// login.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { environment } from '@environments/environment';
import { UserService } from './user.service';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private url = environment.apiUrl;
  user_data = new BehaviorSubject<any>(null);
  location_data = new BehaviorSubject<any>(null);

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private roleService: RoleService
  ) { }

  login(data: any) {
    return this.httpClient.post(this.url + "/api/auth/login", data, {
      headers: new HttpHeaders().set("Content-Type", "application/json")
    }).pipe(
      switchMap((loginResponse: any) => {
        // After successful login, set user data and role
        if (loginResponse && loginResponse.user_data) {
          this.userService.setCurrentUser(loginResponse.user_data);
          // Set the role from the login response
          if (loginResponse.user_data.role) {
            this.roleService.setCurrentUserRole(loginResponse.user_data.role);
          }
        }
        return [loginResponse];
      })
    );
  }
}
