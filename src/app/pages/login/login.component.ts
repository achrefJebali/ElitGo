import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LayoutComponent,FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
