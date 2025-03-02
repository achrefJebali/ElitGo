import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    FooterComponent,
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
    return photo || 'assets/images/small-avatar-1.jpg';
  }

  logout(): void {
    this.userService.logout();
  }
}
