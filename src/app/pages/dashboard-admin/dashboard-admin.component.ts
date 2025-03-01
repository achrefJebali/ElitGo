import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [DashboardHeaderComponent, CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  username: string = '';
  email: string = '';

  constructor(private userService: UserService, private jwtHelper: JwtHelperService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.username = localStorage.getItem('username') || decodedToken.sub;
      this.email = localStorage.getItem('email') || '';
    }
  }

  logout(): void {
    this.userService.logout();
  }
}
