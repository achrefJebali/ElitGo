import { Component, OnInit } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [DashboardHeaderComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})
export class DashboardAdminComponent implements OnInit {
  
  ngOnInit() {
    console.log('Dashboard Admin Loaded');
  }
}
