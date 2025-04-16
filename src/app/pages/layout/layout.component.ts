import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(    private router: Router,){}

  setRole(role: string): void {
    sessionStorage.setItem('userRole', role);

    this.router.navigate(['/dashboard-admin']);
  }

}
