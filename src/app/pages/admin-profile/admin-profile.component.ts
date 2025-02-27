import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import du CommonModule
import { JwtHelperService } from '@auth0/angular-jwt';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent], // ✅ Ajouter CommonModule
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit {
  user: User | null = null; // ✅ Déclaration correcte

  constructor(private userService: UserService, private jwtHelper: JwtHelperService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      const username = decodedToken?.sub;

      if (username) {
        this.userService.getUserByUsername(username).subscribe(
          (data) => this.user = data,
          (error) => console.error('Error fetching user data:', error)
        );
      }
    }
  }
}
