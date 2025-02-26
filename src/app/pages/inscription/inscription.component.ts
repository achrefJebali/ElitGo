import { Component } from '@angular/core'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, LayoutComponent, FooterComponent],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
})
export class InscriptionComponent {
  user: User = {
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    address: '',
    photo: '',
    status: '',
    balance: 0,
    role: 'STUDENT',
    token: '',
    isPaid: false,
    weeklyInterviews: 0,
  };

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(): void {
    this.userService.addUser(this.user).subscribe({
      next: (response) => {
        console.log('User successfully created!', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('There was an error!', error);
      }
    });
    
  }
}
