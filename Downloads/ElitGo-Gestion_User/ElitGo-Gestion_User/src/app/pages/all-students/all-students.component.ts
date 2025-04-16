import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { User, Role } from '../models/user.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-all-students',
  standalone: true,
  imports: [
    CommonModule, 
    LayoutComponent, 
    FooterComponent, 
    DashboardHeaderComponent, 
    RouterModule
  ],
  templateUrl: './all-students.component.html',
  styleUrls: ['./all-students.component.scss']
})
export class AllStudentsComponent implements OnInit {
  students: User[] = [];
  loading = false;
  error = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getStudents();
  }

  getStudents(): void {
    this.loading = true;
    this.error = '';
    this.userService.getStudents().subscribe({
      next: (students: User[]) => {
        this.students = students;
        this.loading = false;
      },
      error: error => {
        console.error('Error fetching students:', error);
        this.error = 'Failed to load students. Please try again.';
        this.loading = false;
      }
    });
  }
  logout(): void {
    this.userService.logout();
  }
}
