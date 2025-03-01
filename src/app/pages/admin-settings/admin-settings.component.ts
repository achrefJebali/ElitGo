import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [DashboardHeaderComponent, FormsModule, CommonModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  user: User = {} as User;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordError: string = '';
  deleteAccountPassword: string = '';
  deleteAccountError: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const username = localStorage.getItem('username');
    if (username) {
      this.userService.getUserByUsername(username).subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          console.error('Error loading user data:', error);
        }
      );
    }
  }

  saveChanges(): void {
    this.userService.modifyUser(this.user).subscribe(
      (updatedUser) => {
        alert('Profile updated successfully!');
        this.user = updatedUser;
      },
      (error) => {
        console.error('Error updating user:', error);
        alert('Failed to update profile.');
      }
    );
  }

  updatePassword(): void {
    this.passwordError = ''; // Reset error message
  
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = "New passwords do not match!";
      return;
    }
  
    if (!this.user.username) {
      this.passwordError = "User not found!";
      return;
    }
  
    this.userService.changePassword(this.user.username, this.passwordData.currentPassword, this.passwordData.newPassword)
      .subscribe(
        (response: any) => { 
          console.log("Password update response:", response);
  
          if (response && response.message) {
            alert(response.message);
          } else {
            alert('Password updated successfully!');
          }
  
          // Clear input fields
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        },
        (error) => {
          console.error("Error updating password:", error);
  
          // Extract error message from response
          this.passwordError = error?.error?.message || "Incorrect current password or failed to update password.";
        }
      );
  }

  deleteAccount(): void {
    this.deleteAccountError = '';

    if (!this.deleteAccountPassword) {
      this.deleteAccountError = "Please enter your password to confirm account deletion";
      return;
    }

    if (!this.user.id) {
      this.deleteAccountError = "User not found!";
      return;
    }

    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmDelete) {
      this.userService.removeUser(this.user.id).subscribe(
        () => {
          alert('Your account has been successfully deleted.');
          this.userService.logout(); // This will now handle both cleanup and navigation
        },
        (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account. Please try again.');
        }
      );
    }
  }
}
