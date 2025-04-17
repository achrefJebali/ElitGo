import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent,
    RouterModule
  ],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const username = localStorage.getItem('username');
    if (!username) {
      this.error = 'No user logged in';
      return;
    }

    this.loading = true;
    this.error = ''; // Reset error before new request
    
    this.userService.getUserByUsername(username).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.loading = false;
        } else {
          this.error = 'User not found';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération de l\'utilisateur';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
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
