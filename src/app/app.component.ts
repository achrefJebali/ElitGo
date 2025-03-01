import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Importer RouterOutlet directement

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ElitGoPublic';
}