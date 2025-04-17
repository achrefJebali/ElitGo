import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';


@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [DashboardHeaderComponent],
  templateUrl: './dashboard-profile.component.html',
  styleUrl: './dashboard-profile.component.css'
})
export class DashboardProfileComponent {

}
