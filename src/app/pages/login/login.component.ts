import { Component, inject } from '@angular/core'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';  
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, LayoutComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  private userService = inject(UserService);
  private router = inject(Router);

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.userService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          // Always redirect to dashboard-admin after successful login
          setTimeout(() => {
            this.router.navigate(['/dashboard-admin']).then(() => {
              console.log('Navigation complete');
            }).catch(err => {
              console.error('Navigation error:', err);
            });
          }, 100);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Invalid credentials, please try again!';
      }
    });
  }
}
