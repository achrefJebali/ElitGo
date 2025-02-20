import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-dashboard-notif',
  standalone: true,
  imports: [DashboardHeaderComponent],
  templateUrl: './dashboard-notif.component.html',
  styleUrl: './dashboard-notif.component.css'
})
export class DashboardNotifComponent {

}
