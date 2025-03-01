import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { User } from '../models/user.model';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [CommonModule, LayoutComponent, FooterComponent, DashboardHeaderComponent],
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss']
})
export class AllUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUser().subscribe(
      (users: User[]) => {
        this.users = users;
      },
      error => {
        console.error('Error fetching users:', error);
      }
    );
  }

  toggleSidebar(): void {
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show');
    }
  }

  logout(): void {
    // Implement logout logic here
    console.log('Logout clicked');
  }
}
