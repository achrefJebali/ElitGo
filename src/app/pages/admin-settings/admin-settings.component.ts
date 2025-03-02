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
  selectedPhoto: File | null = null;
  photoError: string = '';

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
          console.log('Loaded user data:', data);
          this.user = data;
          if (this.user.photo) {
            console.log('Photo URL from server:', this.user.photo);
            console.log('Constructed photo URL:', this.getPhotoUrl());
          }
        },
        (error) => {
          console.error('Error loading user data:', error);
        }
      );
    }
  }

  getPhotoUrl(): string {
    if (!this.user?.photo) {
      return 'assets/images/small-avatar-1.jpg';
    }
    
    // If it's already a full URL, return it
    if (this.user.photo.startsWith('http')) {
      return this.user.photo;
    }
    
    // If it's a base64 image (during preview), return it
    if (this.user.photo.startsWith('data:image')) {
      return this.user.photo;
    }
    
    // Otherwise, construct the full URL
    return `http://localhost:8085/ElitGo${this.user.photo}`;
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
    this.passwordError = '';
  
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
  
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        },
        (error) => {
          console.error("Error updating password:", error);
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
          this.userService.logout();
        },
        (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account. Please try again.');
        }
      );
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.photoError = 'Please select an image file';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = 'File size should not exceed 5MB';
        return;
      }
      
      this.selectedPhoto = file;
      this.photoError = '';
    }
  }

  uploadPhoto(): void {
    if (!this.selectedPhoto || !this.user.id) {
      return;
    }

    // Create a temporary URL for immediate display before upload
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.user.photo = e.target.result;
      console.log('Temporary photo URL:', this.user.photo);
    };
    reader.readAsDataURL(this.selectedPhoto);

    this.userService.uploadPhoto(this.user.id, this.selectedPhoto).subscribe(
      (response) => {
        console.log('Upload response:', response);
        
        if (response) {
          // Handle different response formats
          const photoUrl = response.photoUrl || response.photo || response.path || response;
          console.log('Extracted photo URL:', photoUrl);
          
          if (typeof photoUrl === 'string') {
            // Update the user's photo property
            this.user.photo = photoUrl;
            console.log('Updated user photo:', this.user.photo);
            console.log('Constructed photo URL:', this.getPhotoUrl());
            
            // Update the user object with the new photo
            const userUpdate = { ...this.user };
            this.userService.modifyUser(userUpdate).subscribe(
              (updatedUser) => {
                console.log('Updated user:', updatedUser);
                this.user = updatedUser;
                console.log('Final photo URL:', this.getPhotoUrl());
                
                // Refresh user data to ensure we have the latest state
                this.loadUserData();
                alert('Photo uploaded successfully!');
              },
              (error) => {
                console.error('Error updating user:', error);
                this.photoError = 'Photo uploaded but failed to update profile. Please refresh the page.';
              }
            );
          } else {
            console.error('Invalid photo URL format:', photoUrl);
            this.photoError = 'Invalid photo URL from server';
          }
        } else {
          console.error('Empty response from server');
          this.photoError = 'Invalid response from server';
        }
        this.selectedPhoto = null;
      },
      (error) => {
        console.error('Error uploading photo:', error);
        this.photoError = 'Failed to upload photo. Please try again.';
      }
    );
  }

  private refreshUserData(): void {
    if (this.user.id) {
      this.userService.getUserById(this.user.id).subscribe(
        (userData) => {
          this.user = userData;
        },
        (error) => {
          console.error('Error refreshing user data:', error);
        }
      );
    }
  }
}
