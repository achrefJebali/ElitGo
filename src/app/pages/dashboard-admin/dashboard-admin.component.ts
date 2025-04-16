import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';



@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [DashboardHeaderComponent, CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
    user: User | null = null;
  username: string = '';
  email: string = '';

  constructor(private userService: UserService, private jwtHelper: JwtHelperService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.username = localStorage.getItem('username') || decodedToken.sub;
      this.email = localStorage.getItem('email') || '';
    }
  }

  getPhotoUrl(photo: string | undefined): string {
    if (!photo) {
      // Utiliser une image par défaut qui existe dans le projet
      return '/assets/images/small-avatar-1.jpg';
    }
    
    // Gérer différents formats d'URL
    if (photo.startsWith('http')) {
      return photo;
    }
    
    if (photo.startsWith('data:image')) {
      return photo;
    }
    
    // S'assurer qu'on utilise le bon format de chemin pour le backend
    const basePath = 'http://localhost:8085/ElitGo';
    const photoPath = photo.startsWith('/') ? photo : '/' + photo;
    
    return basePath + photoPath;
  }

  logout(): void {
    this.userService.logout();
  }
}
