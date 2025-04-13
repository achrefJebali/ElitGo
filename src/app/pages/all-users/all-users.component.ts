import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User, Role } from '../models/user.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { UserDetailsDialogComponent } from '../dialog/user-details-dialog/user-details-dialog.component';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];
  userRoles = Role;
  loading = false;
  error = '';

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    console.log('Loading users with simplified approach...');
    
    // Use the simplified direct approach now that the backend is fixed
    this.userService.getUser().subscribe({
      next: (users) => {
        console.log('Users received successfully:', users);
        // Ensure we receive valid data
        if (users && Array.isArray(users)) {
          this.users = users;
          if (users.length === 0) {
            this.error = 'No users found in the database.';
          }
        } else {
          console.error('Received invalid users data format:', users);
          this.error = 'Received invalid data format from server.';
          this.users = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users. Please try again later.';
        this.loading = false;
      },
      complete: () => {
        console.log('User loading completed');
        this.loading = false;
      }
    });
  }

  viewProfile(user: User): void {
    this.dialog.open(UserDetailsDialogComponent, {
      width: '500px',
      data: user,
      panelClass: ['user-details-dialog', 'centered-dialog', 'mat-dialog-centered'],
      maxWidth: '100vw',
      maxHeight: '90vh'
    });
  }

  updateRole(user: User, newRole: Role): void {
    if (!user.id) return;
    
    this.loading = true;
    this.error = '';
    
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        // Update user in the list with new role
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.error = 'Failed to update user role. Please try again.';
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.userService.logout();
  }
}
