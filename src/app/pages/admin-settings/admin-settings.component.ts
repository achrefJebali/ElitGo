import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, DashboardHeaderComponent],
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
  passwordSuccess: string = '';
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
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserByUsername(username).subscribe({
      next: (userData) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  getPhotoUrl(): string {
    if (!this.user?.photo) {
      // Utiliser une image par défaut qui existe dans le projet
      return "/assets/images/small-avatar-1.jpg"; // Ajouter un slash au début
    }
    
    // Handle différent photo URL formats
    if (this.user.photo.startsWith('http')) {
      return this.user.photo;
    }
    
    if (this.user.photo.startsWith('data:image')) {
      return this.user.photo;
    }
    
    // Make sure we're using the correct path format for the backend
    // Fix: Éviter les doubles slashes dans l'URL
    const basePath = 'http://localhost:8085/ElitGo';
    const photoPath = this.user.photo.startsWith('/') ? this.user.photo : '/' + this.user.photo;
    
    console.log('Photo path used:', basePath + photoPath); // Log pour débogage
    return basePath + photoPath;
  }
  

  saveChanges(): void {
    this.userService.modifyUser(this.user).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert('Failed to update profile.');
      }
    });
  }

  updatePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    // Validate passwords
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.passwordError = "All password fields are required!";
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = "New passwords do not match!";
      return;
    }

    if (this.passwordData.currentPassword === this.passwordData.newPassword) {
      this.passwordError = "New password must be different from current password!";
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.passwordError = "New password must be at least 6 characters long!";
      return;
    }

    if (!this.user.username) {
      this.passwordError = "User not found!";
      return;
    }

    this.userService.changePassword(
      this.user.username,
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: (response) => {
        console.log('Password change response:', response);
        this.passwordSuccess = 'Password updated successfully!';
        // Clear the form
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (error) => {
        console.error("Error updating password:", error);
        this.passwordError = error?.message || "Failed to update password. Please check your current password and try again.";
      }
    });
  }

  deleteAccount(): void {
    this.deleteAccountError = '';

    if (!this.deleteAccountPassword) {
      this.deleteAccountError = "Please enter your password to confirm account deletion.";
      return;
    }

    if (!this.user.id || !this.user.username) {
      this.deleteAccountError = "User not found!";
      return;
    }

    // First verify the password
    this.userService.changePassword(this.user.username, this.deleteAccountPassword, this.deleteAccountPassword)
      .subscribe({
        next: (response) => {
          // Password verified, proceed with account deletion
          const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
          if (confirmDelete) {
            this.userService.removeUser(this.user.id!).subscribe({
              next: () => {
                alert('Your account has been successfully deleted.');
                this.userService.logout(); // This will clear storage and redirect to home
              },
              error: (error) => {
                console.error('Error deleting account:', error);
                this.deleteAccountError = 'Failed to delete account. Please try again.';
              }
            });
          }
        },
        error: (error) => {
          console.error('Error verifying password:', error);
          this.deleteAccountError = error?.message || 'Incorrect password. Please try again.';
        }
      });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.photoError = 'Please select an image file';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.photoError = 'File size should not exceed 5MB';
        return;
      }

      this.selectedPhoto = file;
      this.photoError = '';
      
      // Show preview of the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const previewUrl = e.target.result;
        // Update UI with the preview image temporarily
        this.user.photo = previewUrl;
      };
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  uploadPhoto(): void {
    if (!this.selectedPhoto || !this.user.id) {
      this.photoError = "Please select a photo first";
      return;
    }
  
    // Store the preview URL in case we need to revert
    const previewUrl = this.user.photo;
    
    // Afficher l'indicateur de chargement
    const loadingElement = document.getElementById('photoLoadingMessage');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
    
    this.userService.uploadPhoto(this.user.id, this.selectedPhoto).subscribe({
      next: (response) => {
        // Masquer l'indicateur de chargement
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
        
        console.log('Upload response:', response); // Debug API response
  
        if (response && response.photoUrl) {
          // Update the user object with the server URL
          this.user = { ...this.user, photo: response.photoUrl };
          // Show success message instead of alert
          this.photoError = ''; // Clear any previous errors
          this.passwordSuccess = 'Photo uploaded successfully!'; // Reuse existing success message field
          // Keep the selected photo null as we're done with it
          this.selectedPhoto = null;
        } else {
          this.photoError = 'Invalid response from server';
          // Revert to the preview if there was an error
          this.user.photo = previewUrl;
        }
      },
      error: (error) => {
        // Masquer l'indicateur de chargement
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
        
        console.error('Error uploading photo:', error);
        this.photoError = 'Failed to upload photo: ' + (error.message || 'Unknown error');
        // Revert to the preview if there was an error
        this.user.photo = previewUrl;
        this.selectedPhoto = null;
      }
    });
  }
  
}