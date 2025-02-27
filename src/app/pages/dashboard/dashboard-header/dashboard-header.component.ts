import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service'; // Import du service utilisateur
import { JwtHelperService } from '@auth0/angular-jwt';



@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css'
})
export class DashboardHeaderComponent implements OnInit {
  username: string = '';
  email: string = '';
  constructor(private userService: UserService, private jwtHelper: JwtHelperService) {}

  
  logout(): void {
    this.userService.logout(); // ✅ Supprimer le token du localStorage
    window.location.href = '/login'; // ✅ Rediriger vers la page de connexion
  }

  



  ngOnInit(): void {
    // ✅ Récupérer le token depuis localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // ✅ Décoder le token pour extraire le username
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.username = decodedToken.sub; // 'sub' contient généralement le username

      // ✅ Récupérer les informations de l'utilisateur depuis l'API
      this.userService.getUserByUsername(this.username).subscribe(
        (user) => {
          this.email = user.email; // Met à jour l'email dans le header
        },
        (error) => {
          console.error('Erreur lors de la récupération de l\'utilisateur', error);
        }
      );
    }
  }
}
