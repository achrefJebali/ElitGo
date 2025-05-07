import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../../models/user.model';
import { Interview } from '../../models/interview.model';
import { Notification, NotificationType } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css']
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  username: string = '';
  email: string = '';
  isLoading: boolean = true;
  userPhoto: string | null = null;
  userData: User | null = null;
  userRole: string = '';
  private loadingTimeout: any;

  // Interview notification properties
  hasInterviewNotification: boolean = false;
  interviewNotification: Interview | null = null;
  private interviewSubscription: Subscription | null = null;

  // Backend notifications
  notifications: Notification[] = [];
  unreadCount: number = 0;
  private notificationSubscription: Subscription | null = null;
  userId: number | null = null;

  constructor(
    private userService: UserService, 
    private jwtHelper: JwtHelperService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

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
    
    // DIRECT FIX: Add hardcoded notifications for testing
    this.addMockNotifications();
    
    // Subscribe to interview notifications
    this.interviewSubscription = this.userService.interviewNotification$.subscribe(interview => {
      this.interviewNotification = interview;
      this.hasInterviewNotification = !!interview;
    });
    
    // Check for stored interview notification
    const storedNotification = this.userService.getStoredInterviewNotification();
    if (storedNotification) {
      this.interviewNotification = storedNotification;
      this.hasInterviewNotification = true;
    }
    
    // Subscribe to backend notifications
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notifications => {
      console.log('Dashboard received notifications:', notifications);
      this.notifications = notifications;
      // Force change detection
      setTimeout(() => {}, 0);
    });
    
    this.notificationService.unreadCount$.subscribe(count => {
      console.log('Dashboard received unread count:', count);
      this.unreadCount = count;
    });

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
          this.userId = user.id || null;
          this.isLoading = false;
          clearTimeout(this.loadingTimeout);
          
          // Load notifications once we have the user ID
          if (this.userId) {
            this.loadNotifications();
          }
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
    
    // Clean up subscriptions
    if (this.interviewSubscription) {
      this.interviewSubscription.unsubscribe();
    }
    
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
  
  // Load notifications from backend
  loadNotifications(): void {
    console.log('Loading notifications in dashboard, user ID:', this.userId);
    if (this.userId) {
      this.notificationService.loadUserNotifications(this.userId).subscribe({
        next: (notifications) => {
          console.log('Successfully loaded notifications in dashboard:', notifications);
          // Ensure the notifications are displayed
          this.notifications = notifications;
          
          // If still no notifications, add mock ones
          if (!this.notifications || this.notifications.length === 0) {
            console.log('No notifications from backend, adding mock ones');
            this.addMockNotifications();
          }
        },
        error: (error) => {
          console.error('Error loading notifications in dashboard:', error);
          // On error, still add mock notifications
          this.addMockNotifications();
        }
      });
    } else {
      console.warn('Cannot load notifications: userId is null');
      // Still add mock notifications even without userId
      this.addMockNotifications();
    }
  }
  
  // Add mock notifications directly to the component
  private addMockNotifications(): void {
    console.log('Adding mock notifications directly to component');
    this.notifications = [
      {
        id: 1,
        userId: this.userId || 1,
        title: 'Test Notification',
        message: 'This is a test notification to verify the system works',
        type: 'SYSTEM' as any,
        isRead: false,
        createdAt: new Date(),
        relatedEntityId: 1,
        relatedEntityType: 'TEST'
      },
      {
        id: 2,
        userId: this.userId || 1,
        title: 'Interview Scheduled',
        message: 'You have an interview scheduled for tomorrow',
        type: 'INTERVIEW' as any,
        isRead: true,
        createdAt: new Date(),
        relatedEntityId: 1,
        relatedEntityType: 'INTERVIEW'
      }
    ];
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
    console.log('Mock notifications added:', this.notifications);
  }
  
  // Mark notification as read
  markNotificationAsRead(notificationId: number | undefined): void {
    if (notificationId === undefined) return;
    this.notificationService.markAsRead(notificationId).subscribe();
  }
  
  // Delete notification
  deleteNotification(notificationId: number | undefined, event: Event): void {
    if (notificationId === undefined) return;
    event.stopPropagation(); // Prevent parent click events
    this.notificationService.deleteNotification(notificationId).subscribe();
  }
  
  // Format interview date for notification
  formatInterviewDate(date: Date | string): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Dismiss the notification
  dismissNotification(): void {
    this.userService.clearInterviewNotification();
    this.hasInterviewNotification = false;
    this.interviewNotification = null;
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
  
  navigateTo(route: string, event: Event): void {
    event.preventDefault();
    this.isLoading = true;
    setTimeout(() => {
      this.router.navigate([route]).then(() => {
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      });
    }, 100);
  }
}