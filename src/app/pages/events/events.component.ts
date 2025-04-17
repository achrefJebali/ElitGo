import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common'; // Import de CommonModule
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { EventsService } from '../../services/events.service'; // Import du service
import { Event } from '../../models/event.model'; // Assure-toi d'avoir ce modèle
import { EventRegistrationService } from '../../services/event-registration.service'; // Import du service d'inscription

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, LayoutComponent, FooterComponent], // Ajoute CommonModule ici
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];  // Utilisation du modèle
  selectedEvent: Event | null = null; // Pour stocker l'événement sélectionné pour le modal
  isRegistering: boolean = false; // Pour gérer l'état d'inscription
  registrationMessage: string = ''; // Message de confirmation ou d'erreur
  isUserRegistered: boolean = false; // Pour vérifier si l'utilisateur est déjà inscrit

  constructor(
    private eventsService: EventsService,
    private eventRegistrationService: EventRegistrationService
  ) {}
  

  ngOnInit(): void {
    this.loadEvents();
    
    // Ajouter un gestionnaire pour la touche Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  loadEvents(): void {
    this.eventsService.getEvents().subscribe(
      (data) => {
        console.log('Événements reçus:', data); // Ajoute un log pour voir les données
        this.events = data; // Affecte les événements à la variable
      },
      (error) => {
        console.error('Erreur lors du chargement des événements', error);
      }
    );
  }
  
  // Méthode pour transformer le chemin d'image relatif en URL complète
  getImageUrl(imagePath: string): string {
    // Si l'image est vide ou null, retourner une image par défaut
    if (!imagePath) {
      return 'assets/images/ev1.png'; // Image par défaut
    }
    
    // Si l'image est déjà une URL complète (commence par http ou https), la retourner telle quelle
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si l'image commence déjà par un slash, s'assurer qu'il n'y a pas de double slash
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // Construire l'URL complète en ajoutant le chemin de base du serveur
    return `http://localhost:8085/ElitGo${path}`;
  }

  // Méthode pour ouvrir le modal avec les détails de l'événement
  openEventDetails(event: Event): void {
    console.log('Ouverture du modal pour événement:', event);
    this.selectedEvent = event;
    this.registrationMessage = '';
    
    // Vérifier si l'utilisateur est déjà inscrit à cet événement
    this.checkRegistrationStatus();
    
    const modal = document.getElementById('eventDetailsModal');
    if (modal) {
      try {
        // Utiliser directement un nouvel objet Modal sans vérifier l'instance
        const bsModal = new (window as any).bootstrap.Modal(modal);
        bsModal.show();
      } catch (error) {
        console.error('Erreur lors de l\'ouverture du modal avec Bootstrap:', error);
        // Méthode de secours
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
      }
    }
  }

  // Méthode pour fermer le modal
  closeModal(): void {
    console.log('Tentative de fermeture du modal');
    
    // Ajouter une petite vérification pour éviter de fermer un modal déjà fermé
    if (!this.selectedEvent) {
      console.log('Aucun événement sélectionné, le modal est probablement déjà fermé');
      return;
    }
    
    // Réinitialiser l'état
    this.registrationMessage = '';
    
    const modal = document.getElementById('eventDetailsModal');
    if (modal) {
      try {
        // Supprimer tous les backdrops existants d'abord (cela peut être la source du problème)
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          if (backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
          }
        });
        
        // Essayer d'utiliser l'API Bootstrap si disponible
        if (typeof (window as any).bootstrap !== 'undefined') {
          // Récupérer l'instance existante ou en créer une nouvelle
          const bsModal = (window as any).bootstrap.Modal.getInstance(modal) || 
                         new (window as any).bootstrap.Modal(modal);
          bsModal.hide();
        } else {
          // Méthode de secours
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');
        }
        
        // Réinitialiser l'événement sélectionné après la fermeture
        this.selectedEvent = null;
      } catch (error) {
        console.error('Erreur lors de la fermeture du modal:', error);
        // Dernier recours - manipulation directe du DOM
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Supprimer le backdrop s'il existe
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop && backdrop.parentNode) {
          backdrop.parentNode.removeChild(backdrop);
        }
        
        // Réinitialiser l'événement sélectionné après la fermeture
        this.selectedEvent = null;
      }
      
      // Réinitialiser le reste de l'état
      this.isUserRegistered = false;
      this.registrationMessage = '';
    }
  }

  // Formater la date pour l'affichage
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString;
    }
  }

  // Méthode pour s'inscrire à un événement
  registerForEvent(): void {
    if (!this.selectedEvent) {
      this.registrationMessage = 'Erreur: Aucun événement sélectionné.';
      return;
    }

    const eventId = this.selectedEvent.id;
    if (eventId === undefined || eventId === null) {
      this.registrationMessage = 'Erreur: L\'événement n\'a pas d\'ID valide.';
      return;
    }

    this.isRegistering = true;
    this.registrationMessage = 'Traitement de votre inscription...';

    console.log(`Tentative d'inscription pour l'événement ID: ${eventId}`);

    this.eventRegistrationService.registerUserForEvent(eventId).subscribe({
      next: (response) => {
        console.log('Réponse d\'inscription:', response);
        this.isRegistering = false;
        this.isUserRegistered = true;
        this.registrationMessage = 'Votre inscription a été confirmée avec succès! Un email de confirmation a été envoyé à votre adresse email.';
        
        // Mettre à jour le nombre de participants après inscription
        if (this.selectedEvent) {
          if (typeof this.selectedEvent.currentParticipants === 'number') {
            // Ne pas dépasser la capacité maximale
            if (
              typeof this.selectedEvent.maxParticipants === 'number' &&
              this.selectedEvent.currentParticipants < this.selectedEvent.maxParticipants
            ) {
              this.selectedEvent.currentParticipants += 1;
            }
          } else {
            // Premier inscrit
            this.selectedEvent.currentParticipants = 1;
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'inscription:', error);
        this.isRegistering = false;
        
        // Messages d'erreur spécifiques basés sur le code HTTP
        if (error.status === 409) {
          this.registrationMessage = 'Vous êtes déjà inscrit à cet événement.';
        } else if (error.status === 403) {
          this.registrationMessage = 'L\'événement a atteint sa capacité maximale.';
        } else if (error.status === 0) {
          this.registrationMessage = 'Erreur de connexion au serveur. Vérifiez que le backend est en cours d\'exécution et que CORS est correctement configuré.';
        } else {
          // Message d'erreur plus détaillé
          const errorMsg = error.error?.message || error.message || 'Erreur inconnue';
          this.registrationMessage = `Erreur lors de l'inscription: ${errorMsg}`;
        }
      }
    });
  }

  // Annuler une inscription
  cancelRegistration(): void {
    if (!this.selectedEvent) {
      this.registrationMessage = 'Erreur: Aucun événement sélectionné.';
      return;
    }

    const eventId = this.selectedEvent.id;
    if (eventId === undefined || eventId === null) {
      this.registrationMessage = 'Erreur: L\'événement n\'a pas d\'ID valide.';
      return;
    }

    this.isRegistering = true;
    this.registrationMessage = 'Traitement de votre annulation...';

    console.log(`Tentative d'annulation d'inscription pour l'événement ID: ${eventId}`);

    this.eventRegistrationService.cancelRegistration(eventId).subscribe({
      next: (response) => {
        console.log('Réponse d\'annulation:', response);
        this.isRegistering = false;
        this.isUserRegistered = false;
        this.registrationMessage = 'Votre inscription a été annulée avec succès! Un email de confirmation d\'annulation a été envoyé à votre adresse email.';
        
        // Mettre à jour le nombre de participants si disponible
        if (this.selectedEvent && typeof this.selectedEvent.currentParticipants === 'number') {
          this.selectedEvent.currentParticipants = Math.max(0, this.selectedEvent.currentParticipants - 1);
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.isRegistering = false;
        
        // Messages d'erreur spécifiques basés sur le code HTTP
        if (error.status === 404) {
          this.registrationMessage = 'Aucune inscription trouvée pour cet événement.';
        } else if (error.status === 400) {
          // Traitement spécifique de l'erreur 400 Bad Request
          this.registrationMessage = 'L\'annulation n\'a pas pu être effectuée. Rafraîchissez la page et réessayez.';
          // Si l'erreur 400 contient un message spécifique, utilisez-le
          if (error.error?.message) {
            this.registrationMessage = `Erreur: ${error.error.message}`;
          }
          // Afficher l'événement comme non inscrit malgré l'erreur (car la BDD a été mise à jour)
          this.isUserRegistered = false;
        } else if (error.status === 0) {
          this.registrationMessage = 'Erreur de connexion au serveur. Vérifiez que le backend est en cours d\'exécution et que CORS est correctement configuré.';
        } else {
          // Message d'erreur plus détaillé
          const errorMsg = error.error?.message || error.message || 'Erreur inconnue';
          this.registrationMessage = `Erreur lors de l'annulation: ${errorMsg}`;
        }
      }
    });
  }

  // Vérifier si l'utilisateur est inscrit lors de l'ouverture du modal
  checkRegistrationStatus(): void {
    if (!this.selectedEvent) {
      this.isUserRegistered = false;
      return;
    }

    // Vérifier si l'ID de l'événement existe
    const eventId = this.selectedEvent.id;
    if (eventId === undefined || eventId === null) {
      console.error('L\'événement n\'a pas d\'ID valide');
      this.isUserRegistered = false;
      return;
    }

    this.eventRegistrationService.isUserRegistered(eventId).subscribe(
      (isRegistered) => {
        console.log(`Statut d'inscription pour l'événement ${eventId}:`, isRegistered);
        this.isUserRegistered = isRegistered;
      },
      (error) => {
        console.error('Erreur lors de la vérification du statut d\'inscription:', error);
        this.isUserRegistered = false;
        
        // Ne pas afficher de message d'erreur ici car cette méthode est appelée automatiquement
        // lors de l'ouverture du modal et n'est pas une action explicite de l'utilisateur
      }
    );
  }
}
