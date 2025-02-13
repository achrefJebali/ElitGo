import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [
    LayoutComponent,FooterComponent
  ],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css'
})
export class BlogsComponent {

}



