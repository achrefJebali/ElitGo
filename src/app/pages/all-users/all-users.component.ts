import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
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
    LayoutComponent, 
    FooterComponent, 
    DashboardHeaderComponent, 
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
    this.userService.getUser().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users. Please try again later.';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  viewProfile(user: User): void {
    this.dialog.open(UserDetailsDialogComponent, {
      width: '500px',
      data: user,
      position: { top: '50px' },
      panelClass: ['user-details-dialog', 'centered-dialog'],
      maxWidth: '100vw',
      maxHeight: '90vh'
    });
  }

  updateRole(user: User, newRole: Role): void {
    if (!user.id) return;
    
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (error) => {
        console.error('Error updating user role:', error);
      }
    });
  }

  logout(): void {
    this.userService.logout();
  }
}
