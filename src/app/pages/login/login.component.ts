import { Component, inject } from '@angular/core'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';  
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { JwtHelperService } from '@auth0/angular-jwt';

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

  private userService = inject(UserService); 
  private router = inject(Router); 
  private jwtHelper = inject(JwtHelperService); 

  login(): void {
    this.userService.login(this.username, this.password).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);

        // ✅ Décoder le token pour récupérer les informations de l'utilisateur
        const decodedToken: any = this.jwtHelper.decodeToken(response.token);
        console.log("Decoded Token:", decodedToken);

        // ✅ Stocker le nom et l'email de l'utilisateur
        localStorage.setItem('username', decodedToken.sub); 
        localStorage.setItem('email', decodedToken.email || ""); 

        // ✅ Redirection sans rechargement forcé
        this.router.navigateByUrl('/dashboard-admin');
      },
      (error) => {
        this.errorMessage = 'Invalid credentials, please try again!';
      }
    );
  }
}
