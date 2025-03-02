import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { User, Role } from '../models/user.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-all-teachers',
  standalone: true,
  imports: [
    CommonModule, 
    LayoutComponent, 
    FooterComponent, 
    DashboardHeaderComponent, 
    RouterModule
  ],
  templateUrl: './all-teachers.component.html',
  styleUrls: ['./all-teachers.component.scss']
})
export class AllTeachersComponent implements OnInit {
  teachers: User[] = [];
  loading = false;
  error = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getTeachers();
  }
  logout(): void {
    this.userService.logout();
  }

  getTeachers(): void {
    this.loading = true;
    this.error = '';
    this.userService.getTeachers().subscribe({
      next: (teachers: User[]) => {
        this.teachers = teachers;
        this.loading = false;
      },
      error: error => {
        console.error('Error fetching teachers:', error);
        this.error = 'Failed to load teachers. Please try again.';
        this.loading = false;
      }
    });
  }
}
