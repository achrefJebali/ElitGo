import { Component } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';








@Component({
  selector: 'app-annoncement',
  standalone: true,
  imports: [
LayoutComponent,FooterComponent
  ],
  templateUrl: './annoncement.component.html',
  styleUrl: './annoncement.component.css'
})
export class AnnoncementComponent {
  isLiked = false;
isDisliked = false;

toggleLike() {
  this.isLiked = !this.isLiked;
  if (this.isLiked) this.isDisliked = false;
}

toggleDislike() {
  this.isDisliked = !this.isDisliked;
  if (this.isDisliked) this.isLiked = false;
}


}
