import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [LayoutComponent, FooterComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isSubmitting: boolean = false;
  isTokenValid: boolean = false;
  isTokenValidating: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get token from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      } else {
        this.errorMessage = 'No reset token found. Please request a new password reset link.';
        this.isTokenValidating = false;
      }
    });
  }

  validateToken(): void {
    this.isTokenValidating = true;
    this.authService.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.isTokenValid = response.success;
        this.isTokenValidating = false;
        if (!this.isTokenValid) {
          this.errorMessage = 'Invalid or expired token. Please request a new password reset link.';
        }
      },
      error: (error) => {
        this.isTokenValid = false;
        this.isTokenValidating = false;
        this.errorMessage = 'Invalid or expired token. Please request a new password reset link.';
      }
    });
  }

  resetPassword(): void {
    // Validate input
    if (!this.newPassword) {
      this.errorMessage = 'Please enter a new password';
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Your password has been reset successfully. You will be redirected to the login page.';
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRecover(): void {
    this.router.navigate(['/recover']);
  }
}
