import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';


@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [LayoutComponent,FooterComponent],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.css'
})
export class InscriptionComponent {

}
