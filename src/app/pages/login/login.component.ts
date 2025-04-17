import { Component } from '@angular/core';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [LayoutComponent,FooterComponent],

  imports: [CommonModule, FormsModule, LayoutComponent, FooterComponent],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.error = 'Please enter both username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.userService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        const role = this.userService.getCurrentUserRole();
        if (role) {
          this.redirectBasedOnRole(role);
        } else {
          this.error = 'Invalid response: user role not found';
          console.error('Invalid response: role not found');
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.error = 'Invalid username or password';
        } else if (error.error?.message) {
          this.error = error.error.message;
        } else {
          this.error = 'An error occurred during login. Please try again.';
        }
        console.error('Login error:', error);
      }
    });
  }

  private redirectBasedOnRole(role: string): void {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        this.router.navigate(['/dashboard-admin']);
        break;
      case 'STUDENT':
        this.router.navigate(['/dashboard']);
        break;
      case 'TEACHER':
        this.router.navigate(['/dashboard']);
        break;
      default:
        console.warn('Unknown role:', role);
        this.router.navigate(['/login']);
    }
  }
}
