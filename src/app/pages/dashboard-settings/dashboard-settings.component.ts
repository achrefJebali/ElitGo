import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';


@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [DashboardHeaderComponent],
  templateUrl: './dashboard-settings.component.html',
  styleUrl: './dashboard-settings.component.css'
})
export class DashboardSettingsComponent {

}
