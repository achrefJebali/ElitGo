import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Role } from '../pages/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private jwtHelper: JwtHelperService) {}

  canActivate(route: any): boolean {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      this.router.navigate(['/login']);
      return false;
    }

    // If route requires specific role
    if (route.data?.roles && !route.data.roles.includes(userRole)) {
      // Redirect based on role
      if (userRole === Role.ADMIN) {
        this.router.navigate(['/dashboard-admin']);
      } else {
        this.router.navigate(['/dashboard']);
      }
      return false;
    }

    return true;
  }
}
