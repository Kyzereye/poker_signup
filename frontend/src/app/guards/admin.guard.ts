import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { RoleService } from '../services/role.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private roleService: RoleService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.roleService.hasAdminRole().pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin) {
          return true;
        } else {
          // Redirect to dashboard or show access denied
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}
