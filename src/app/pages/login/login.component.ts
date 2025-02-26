import { Component } from '@angular/core'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, LayoutComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  login(): void {
    this.userService.login(this.username, this.password).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard-admin']);
      },
      (error) => {
        this.errorMessage = 'Invalid credentials, please try again!';
      }
    );
  }

}
