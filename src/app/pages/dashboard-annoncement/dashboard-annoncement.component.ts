import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';


@Component({
  selector: 'app-dashboard-annoncement',
  standalone: true,
  imports: [DashboardHeaderComponent],
  templateUrl: './dashboard-annoncement.component.html',
  styleUrl: './dashboard-annoncement.component.css'
})
export class DashboardAnnoncementComponent {

}
