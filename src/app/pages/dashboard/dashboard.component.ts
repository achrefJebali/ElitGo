import { Component, OnInit } from '@angular/core';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,  
  imports: [DashboardHeaderComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
        this.error = 'Error loading user data';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  getPhotoUrl(photo: string | undefined): string {
    if (!photo) return 'assets/images/small-avatar-1.jpg';
    if (photo.startsWith('http')) return photo;
    return `http://localhost:8085/ElitGo${photo}`;
  }
}
