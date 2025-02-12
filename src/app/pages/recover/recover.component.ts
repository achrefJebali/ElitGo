import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [LayoutComponent,FooterComponent],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {

}
