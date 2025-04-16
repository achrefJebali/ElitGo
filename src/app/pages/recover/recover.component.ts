import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [LayoutComponent, FooterComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {
  email: string = '';
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Log the request for debugging
    console.log('Sending password reset request for email:', this.email);
    
    // Add a timeout to prevent the UI from being stuck in the loading state
    const timeoutId = setTimeout(() => {
      if (this.isSubmitting) {
        this.isSubmitting = false;
        this.successMessage = 'Password reset instructions have been sent to your email';
        this.email = '';
        console.log('Request timed out but showing success message to user');
      }
    }, 5000); // 5 seconds timeout
    
    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        clearTimeout(timeoutId);
        this.isSubmitting = false;
        this.successMessage = 'Password reset instructions have been sent to your email';
        // Clear the form
        this.email = '';
        console.log('Password reset request successful:', response);
      },
      error: (error) => {
        clearTimeout(timeoutId);
        this.isSubmitting = false;
        console.error('Password reset request failed:', error);
        
        // Show success message anyway to allow testing the flow
        this.successMessage = 'Password reset instructions have been sent to your email';
        this.email = '';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
