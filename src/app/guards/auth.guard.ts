import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    console.log('AuthGuard: Token found:', token); // ✅ Debugging Log

    if (!token || this.jwtHelper.isTokenExpired(token)) {
      console.warn('AuthGuard: Token invalid or expired! Redirecting...');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('AuthGuard: Access granted');
    return true;
  }
}
