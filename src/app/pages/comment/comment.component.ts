import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    LayoutComponent , FooterComponent 
],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {

}
