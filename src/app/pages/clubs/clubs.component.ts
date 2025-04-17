import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClubsService } from '../../services/clubs.service';
import { Club } from '../../models/club.model';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ClubQuizService } from '../../services/club-quiz.service';
import { ClubQuizSubmission } from '../../models/club-quiz.model';
import { ClubQuizModalModule } from '../../components/club-quiz-modal/club-quiz-modal.module';

// S'assurer que Bootstrap est disponible globalement
declare global {
  interface Window {
    bootstrap: any;
  }
}

// Alias local pour faciliter l'accès à Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [LayoutComponent, FooterComponent, RouterModule, CommonModule, ClubQuizModalModule],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  // All clubs from database
  allClubs: Club[] = [];
  // Clubs currently displayed in the UI
  clubs: Club[] = [];
  // Number of clubs to display per load
  clubsPerLoad: number = 3;
  // Current index for pagination
  currentDisplayIndex: number = 0;
  
  selectedClub: any = null; // Pour stocker le club sélectionné pour affichage dans le modal
  showQuizModal: boolean = false; // Pour contrôler l'affichage du modal de quiz
  currentUserId: number = 1; // ID statique de l'utilisateur courant (en environnement réel, cela proviendrait du service d'authentification)

  constructor(
    private clubsService: ClubsService,
    private clubQuizService: ClubQuizService
  ) {}

  ngOnInit(): void {
    this.loadClubs();
    
    // Ajouter un gestionnaire pour la touche Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  loadClubs() {
    console.log('Début du chargement des clubs...');
    this.clubsService.getClubs().subscribe(
      (data) => {
        console.log('Clubs reçus:', data);
        
        // Vérifier si data est un tableau
        if (Array.isArray(data)) {
          // Store all clubs in the allClubs array
          this.allClubs = data;
          console.log('Nombre total de clubs chargés:', this.allClubs.length);
          
          // Initialize the display with the first batch of clubs
          this.loadMoreClubs();
        } else {
          console.error('Les données reçues ne sont pas un tableau:', data);
          this.allClubs = [];
          this.clubs = [];
        }
        
        // Vérifier si les clubs ont des emails
        if (this.allClubs && this.allClubs.length > 0) {
          this.allClubs.forEach(club => {
            console.log(`Club ${club.name}, Email: ${club.email}`);
          });
        } else {
          console.warn('Aucun club n\'a été chargé ou tableau vide');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des clubs:', error);
        if (error.status === 0) {
          console.error('Erreur réseau : impossible de se connecter au serveur');
        } else if (error.status === 404) {
          console.error('Erreur 404 : la ressource demandée n\'existe pas');
        } else {
          console.error('Erreur serveur :', error.message);
        }
        this.allClubs = []; // Initialiser à un tableau vide en cas d'erreur
        this.clubs = [];
      }
    );
  }

  // Method to build the complete image URL
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/images/espoir.jpeg'; // Image par défaut
    }

    // Si l'image est déjà une URL complète, la retourner telle quelle
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Add slash prefix if necessary
    const path = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    
    // Build the complete URL
    return `http://localhost:8085/ElitGo${path}`;
  }

  // Method to format emails for display in the template
  // This method is not currently used since we use &#64; in HTML directly
  // but it can be useful for future processing
  formatEmail(email: string): string {
    if (!email) {
      return 'N/A';
    }
    
    // Remplacer @ par &#64; pour éviter les problèmes dans le template Angular
    return email.replace('@', '&#64;');
  }

  openClubDetails(club: Club) {
    console.log('Ouverture du modal pour club:', club);
    this.selectedClub = club;
    
    const modal = document.getElementById('clubDetailsModal');
    if (modal) {
      try {
        // Simple approach without using getInstance
        const bsModal = new (window as any).bootstrap.Modal(modal);
        bsModal.show();
      } catch (error) {
        console.error('Erreur lors de l\'ouverture du modal avec Bootstrap:', error);
        // Fallback method with pure CSS/JS
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }
    } else {
      console.error('Élément modal introuvable');
    }
  }

  openStaticClubDetails(clubData: any) {
    console.log('Ouverture du modal pour club statique:', clubData);
    this.selectedClub = clubData; // Utiliser directement l'objet club reçu
    
    const modal = document.getElementById('clubDetailsModal');
    if (modal) {
      try {
        // Simple approach without using getInstance
        const bsModal = new (window as any).bootstrap.Modal(modal);
        bsModal.show();
      } catch (error) {
        console.error('Erreur lors de l\'ouverture du modal avec Bootstrap:', error);
        // Fallback method with pure CSS/JS
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }
    } else {
      console.error('Élément modal introuvable');
    }
  }

  // Method to close the modal
  closeModal() {
    console.log('Tentative de fermeture du modal');
    
    // Add a small check to avoid closing an already closed modal
    if (!this.selectedClub) {
      console.log('Aucun club sélectionné, le modal est probablement déjà fermé');
      return;
    }
    
    const modal = document.getElementById('clubDetailsModal');
    if (modal) {
      try {
        // Use CSS classes directly to close the modal
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Remove backdrop
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.parentNode?.removeChild(backdrop);
        });
      } catch (error) {
        console.error('Erreur lors de la fermeture du modal:', error);
        // Fallback method in case of error
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Remove all possible backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.parentNode?.removeChild(backdrop);
        });
      }
    }
    
    // Clear the reference to the selected club
    this.selectedClub = null;
  }

  // Method to determine if the selected club comes from the database
  isClubFromDatabase(): boolean {
    if (!this.selectedClub || !this.clubs || this.clubs.length === 0) {
      return false;
    }
    
    // Check if the selected club exists in the database club list
    return this.clubs.some(club => club.id === this.selectedClub.id);
  }

  // Check if the current user is already a member of the selected club
  isUserMemberOfClub(): boolean {
    // In a real environment, this logic would be more complex
    // and would check if the current user is already a member of the club
    // For this example, we assume the user is not yet a member
    return false;
  }

  // Opens the quiz interface to join the club
  openJoinClubQuiz(): void {
    console.log('Opening quiz to join club:', this.selectedClub.name);
    
    // Save the selected club reference before closing the modal
    const clubToJoin = this.selectedClub;
    
    // Close the club details modal properly
    const modal = document.getElementById('clubDetailsModal');
    if (modal) {
      try {
        // Use the Bootstrap modal instance if available
        const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        } else {
          // Fallback to manual DOM manipulation
          modal.classList.remove('show');
          modal.style.display = 'none';
        }
      } catch (error) {
        console.error('Error closing modal:', error);
        // Manual DOM manipulation fallback
        modal.classList.remove('show');
        modal.style.display = 'none';
      }
      
      // Remove backdrop and overflow
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
    }
    
    // Ensure the selected club is maintained
    this.selectedClub = clubToJoin;
    
    // Add a small delay to ensure the previous modal is fully closed
    setTimeout(() => {
      // Activate the flag to display our quiz overlay
      // The *ngIf directive will handle displaying the component
      this.showQuizModal = true;
      document.body.classList.add('overflow-hidden'); // Prevent page scrolling
    }, 100); // Small delay to ensure proper transition
  }

  // Handle quiz completion
  onQuizCompleted(result: any): void {
    console.log('Quiz completed, result:', result);
    
    // Simply disable the visibility of the quiz overlay
    this.showQuizModal = false;
    document.body.classList.remove('overflow-hidden'); // Re-enable page scrolling
    
    // If the quiz was successful, display a message
    if (result && result.passed) {
      // In a real version, you might refresh the list of clubs or take another action
      alert('Congratulations! You have joined the club ' + this.selectedClub.name);
    }
  }
  
  /**
   * Load more clubs for display
   * This method takes the next batch of clubs from allClubs array and adds them to the clubs array
   */
  loadMoreClubs(): void {
    // Calculate the end index for the next batch
    const endIndex = this.currentDisplayIndex + this.clubsPerLoad;
    
    // Get the next batch of clubs
    const newClubs = this.allClubs.slice(this.currentDisplayIndex, endIndex);
    
    // Add the new clubs to the current display
    this.clubs = [...this.clubs, ...newClubs];
    
    // Update the current index
    this.currentDisplayIndex = endIndex;
    
    console.log(`Loaded ${newClubs.length} more clubs. Now displaying ${this.clubs.length} of ${this.allClubs.length} total clubs.`);
  }
  
  /**
   * Check if there are more clubs to load
   */
  hasMoreClubs(): boolean {
    return this.currentDisplayIndex < this.allClubs.length;
  }
}
