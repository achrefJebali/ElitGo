import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-chatroom',
  standalone: true,
  imports: [FooterComponent,LayoutComponent],
  templateUrl: './chatroom.component.html',
  styleUrl: './chatroom.component.css'
})
export class ChatroomComponent {

}
