import { Component, OnInit, inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports:[DashboardHeaderComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {
  username: string = '';
  email: string = '';

  private jwtHelper = inject(JwtHelperService);

  ngOnInit(): void {
    // Récupérer les informations de l'utilisateur connecté
    this.username = localStorage.getItem('username') || 'Unknown User';
    this.email = localStorage.getItem('email') || 'No Email';
  }
}
