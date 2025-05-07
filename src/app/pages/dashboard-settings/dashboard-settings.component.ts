import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardHeaderComponent],
  templateUrl: './dashboard-settings.component.html',
  styleUrls: ['./dashboard-settings.component.css']
})
export class DashboardSettingsComponent implements OnInit {
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
    private router: Router,
    private cdr: ChangeDetectorRef
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
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  getPhotoUrl(): string {
    if (!this.user?.photo) {
      return '/assets/images/small-avatar-1.jpg';
    }
    if (this.user.photo.startsWith('http')) {
      return this.user.photo;
    }
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
    this.passwordSuccess = '';

    // Validate passwords
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
        this.passwordError = error?.message || "Incorrect current password or failed to update password.";
      }
    });
  }

  deleteAccount(): void {
    this.deleteAccountError = '';

    if (!this.deleteAccountPassword) {
      this.deleteAccountError = "Please enter your password to confirm account deletion";
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
    }
  }

  uploadPhoto(): void {
    if (!this.selectedPhoto || !this.user.id) {
      this.photoError = "Please select a photo first";
      return;
    }
  
    // Afficher l'indicateur de chargement
    const loadingElement = document.getElementById('dashboardPhotoLoading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
    
    // First show a preview of the selected image
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Show preview of the selected image
      const previewUrl = e.target.result;
      // Update UI with the preview image
      this.user.photo = previewUrl;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(this.selectedPhoto);
    
    // Store the preview URL in case we need to revert
    const previewUrl = this.user.photo;
  
    // Then upload to server
    this.userService.uploadPhoto(this.user.id, this.selectedPhoto).subscribe({
      next: (response) => {
        // Masquer l'indicateur de chargement
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
        
        console.log('Upload response:', response);
        // Handle the response format from the backend
        const photoUrl = response.photoUrl;
        if (photoUrl) {
          // Update the user's photo with the URL from the server
          this.user.photo = photoUrl;
          this.cdr.detectChanges();
          // Show success message instead of alert
          this.photoError = ''; // Clear any previous errors
          this.passwordSuccess = 'Photo uploaded successfully!'; // Reuse existing success message field
        } else {
          this.photoError = 'Invalid photo URL from server';
          // Revert to the preview if there was an error
          this.user.photo = previewUrl;
        }
        this.selectedPhoto = null;
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
