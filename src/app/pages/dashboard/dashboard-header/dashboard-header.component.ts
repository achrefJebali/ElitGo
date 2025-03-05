import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css']
})
export class DashboardHeaderComponent implements OnInit {
  isLoading: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Force the loader to hide after 3 seconds maximum
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);

    // Hide loader when initial content is loaded
    window.addEventListener('load', () => {
      this.isLoading = false;
    });
  }

  navigateTo(route: string, event: Event): void {
    event.preventDefault();
    this.isLoading = true;
    
    // Use setTimeout to simulate loading and prevent immediate navigation
    setTimeout(() => {
      this.router.navigate([route]).then(() => {
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      });
    }, 100);
  }
}
