import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

let isRefreshing = false;

export const httpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  // Check if this is a public endpoint (login, register, refresh)
  const isPublicEndpoint = req.url.includes('/api/auth/login') || 
                           req.url.includes('/api/auth/user_registration') ||
                           req.url.includes('/api/auth/refresh');

  // Get access token
  const accessToken = tokenService.getAccessToken();
  
  // Clone request and add headers
  let authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Add Authorization header if token exists and not a public endpoint
  if (accessToken && !isPublicEndpoint) {
    authReq = authReq.clone({
      setHeaders: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  // Handle the request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 and not already refreshing and not a public endpoint, try to refresh token
      if (error.status === 401 && !isPublicEndpoint && !isRefreshing) {
        return handle401Error(req, next, tokenService, authService, router, http);
      }

      // Don't retry authentication errors
      if (error.status === 401 || error.status === 403) {
        return throwError(() => error);
      }

      // Retry other errors
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  tokenService: TokenService,
  authService: AuthService,
  router: Router,
  http: HttpClient
): Observable<HttpEvent<unknown>> {
  isRefreshing = true;
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) {
    isRefreshing = false;
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No refresh token available'));
  }

  return http.post(`${environment.apiUrl}/api/auth/refresh`, { refreshToken }).pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      if (response.success && response.accessToken) {
        // Store new access token
        tokenService.setTokens(response.accessToken, refreshToken);
        
        // Retry original request with new token
        const authReq = req.clone({
          setHeaders: {
            'Authorization': `Bearer ${response.accessToken}`
          }
        });
        return next(authReq);
      } else {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => new Error('Token refresh failed'));
      }
    }),
    catchError((error) => {
      isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => error);
    })
  );
}
