import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { RouterModule } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css'
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  username: string = '';
  email: string = '';
  isLoading: boolean = true;
  userPhoto: string | null = null;
  userData: User | null = null;
  userRole: string = '';
  private loadingTimeout: any;

  constructor(private userService: UserService, private jwtHelper: JwtHelperService) {}

  logout(): void {
    this.userService.logout();
  }

  ngOnInit(): void {
    this.isLoading = true;

    // Set a maximum loading time of 3 seconds
    this.loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        console.log('Loading timed out after 3 seconds');
      }
    }, 3000);

    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      this.username = localStorage.getItem('username') || decodedToken.sub;
      this.userRole = localStorage.getItem('role') || '';

      this.userService.getUserByUsername(this.username).subscribe({
        next: (user) => {
          this.userData = user;
          this.email = user.email || '';
          this.userPhoto = user.photo || null;
          this.isLoading = false;
          clearTimeout(this.loadingTimeout);
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.isLoading = false;
          clearTimeout(this.loadingTimeout);
        }
      });
    } else {
      this.isLoading = false;
      clearTimeout(this.loadingTimeout);
    }
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }
  
  /**
   * Retourne l'URL de la photo de profil utilisateur ou une image par défaut
   * Gère plusieurs formats d'URL (http, data URI, chemins relatifs)
   */
  getPhotoUrl(): string {
    if (!this.userPhoto) {
      // Default image based on user role
      if (this.userRole === 'ADMIN') {
        return 'assets/images/admin-avatar.jpg';
      } else if (this.userRole === 'TEACHER') {
        return 'assets/images/teacher-avatar.jpg';
      }
      return 'assets/images/small-avatar-1.jpg';
    }
    
    // Handle different URL formats
    if (this.userPhoto.startsWith('http')) {
      return this.userPhoto;
    }
    
    if (this.userPhoto.startsWith('data:image')) {
      return this.userPhoto;
    }
    
    // Correct format for backend URLs
    const basePath = 'http://localhost:8085/ElitGo';
    const photoPath = this.userPhoto.startsWith('/') ? this.userPhoto : '/' + this.userPhoto;
    return basePath + photoPath;
  }
  
  /**
   * Retourne un nom d'affichage convivial pour l'utilisateur
   * Formate intelligemment le nom selon les données disponibles
   */
  getDisplayName(): string {
    // Priorité à l'affichage du nom complet s'il est disponible
    if (this.userData?.name) {
      return this.userData.name;
    }
    
    // Sinon, utilise le nom d'utilisateur avec une première lettre en majuscule
    if (this.username) {
      return this.username.charAt(0).toUpperCase() + this.username.slice(1);
    }
    
    // Valeur par défaut en cas d'absence de données
    return 'Utilisateur';
  }
  
  /**
   * Retourne le rôle de l'utilisateur formaté pour l'affichage
   * Traduit et formate les rôles pour une meilleure compréhension
   */
  getFormattedRole(): string {
    if (!this.userRole) return 'Utilisateur';
    
    // Conversion des rôles en français avec mise en forme adaptée
    switch(this.userRole.toUpperCase()) {
      case 'ADMIN':
        return 'Administrateur';
      case 'TEACHER':
        return 'Formateur';
      case 'STUDENT':
        return 'Étudiant';
      case 'INTERVIEWER':
        return 'Recruteur';
      default:
        return this.userRole.charAt(0).toUpperCase() + this.userRole.slice(1).toLowerCase();
    }
  }
  
  /**
   * Détermine si l'utilisateur a accès aux fonctionnalités administratives
   */
  hasAdminAccess(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'TEACHER';
  }
  
  /**
   * Retourne la classe CSS appropriée pour le badge de rôle
   */
  getRoleBadgeClass(): string {
    switch(this.userRole.toUpperCase()) {
      case 'ADMIN':
        return 'badge-danger';
      case 'TEACHER':
        return 'badge-primary';
      case 'INTERVIEWER':
        return 'badge-warning';
      case 'STUDENT':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  }
}
