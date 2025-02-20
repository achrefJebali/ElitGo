import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    LayoutComponent,FooterComponent
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

}
