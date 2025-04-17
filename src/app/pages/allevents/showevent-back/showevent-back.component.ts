import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import de CommonModule
import { EventsService } from '../../../services/events.service'; // Import du service
import { PlanningService } from '../../../services/planning.service';
import { Planning } from '../../../models/planning.model';
import { Event } from '../../../models/event.model'; // Assure-toi d'avoir ce modèle
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-showevent-back',
  standalone: true,
  imports: [CommonModule, DashboardHeaderComponent, FormsModule],
  templateUrl: './showevent-back.component.html',
  styleUrls: ['./showevent-back.component.css']
})
export class ShoweventBACKComponent implements OnInit {
  // ...
  // Méthode pour éditer le planning depuis le modal de détails
  isEditing: boolean = false;
  editPlanningDetails(): void {
    if (this.planningDetails) {
      this.planningData = {
        id: this.planningDetails.id || null,
        title: this.planningDetails.title || '',
        description: this.planningDetails.description || '',
        startTime: this.planningDetails.startTime || '',
        endTime: this.planningDetails.endTime || '',
        eventId: this.planningDetails.event?.id || null
      };
      this.isEditing = true;
      this.showPlanningDetailsModal = false;
      this.showPlanningModal = true;
    }
  }
  timeError: boolean = false;
  showPlanningDetailsModal = false;
  planningDetails: any = {};
  // ...
  showPlanningModal = false;
  planningData: any = {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    eventId: null
  };

  addPlanning(event: Event): void {
    this.planningData = {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      eventId: event.id
    };
    this.showPlanningModal = true;
  }

  closePlanningModal(): void {
    this.showPlanningModal = false;
  }

  submitPlanning(): void {
    // Vérification startTime < endTime (format "HH:mm")
    const start = this.planningData.startTime;
    const end = this.planningData.endTime;
    if (start && end && start >= end) {
      this.timeError = true;
      return;
    }
    this.timeError = false;

    // On envoie un objet event au backend pour la liaison
    const planningToSave: any = {
      ...this.planningData,
      event: { id: this.planningData.eventId }
    };
    delete planningToSave.eventId;

    if (this.isEditing && planningToSave.id) {
      // Mode édition : update
      this.planningService.updatePlanning(planningToSave).subscribe({
        next: (response) => {
          console.log('Planning modifié avec succès:', response);
          this.showPlanningModal = false;
          this.isEditing = false;
          this.refreshEventList();
        },
        error: (error) => {
          console.error('Erreur lors de la modification du planning:', error);
        }
      });
    } else {
      // Mode ajout : add
      this.planningService.addPlanning(planningToSave).subscribe({
        next: (response) => {
          console.log('Planning ajouté avec succès:', response);
          // Établir la relation bidirectionnelle entre le planning et l'événement
          if (response && response.id && this.planningData.eventId) {
            this.planningService.linkPlanningToEvent(response.id, this.planningData.eventId).subscribe({
              next: () => {
                console.log('Liaison bidirectionnelle établie avec succès');
                this.showPlanningModal = false;
                this.refreshEventList();
              },
              error: (linkError) => {
                console.error('Erreur lors de l\'établissement de la liaison bidirectionnelle:', linkError);
                this.showPlanningModal = false;
              }
            });
          } else {
            console.warn('Impossible d\'établir la liaison bidirectionnelle: ID manquant');
            this.showPlanningModal = false;
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du planning:', error);
        }
      });
    }
  }
  events: Event[] = [];  // Utilisation du modèle
  filteredEvents: Event[] = []; // Pour stocker les événements filtrés
  searchTerm: string = ''; // Pour stocker le terme de recherche
  showEditModal = false;
  selectedEvent: any = {};
  
  // Propriétés pour le tri
  sortDirection: 'asc' | 'desc' = 'asc'; // Direction du tri (ascendant par défaut)
  sortField: string = 'eventDate'; // Champ utilisé pour le tri
  
  // Propriétés pour la gestion d'upload
  selectedFile: File | null = null;
  uploadError: string | null = null;
  isUploading: boolean = false;

  // Propriétés pour la validation du formulaire
  formErrors: { [key: string]: string } = {};
  submitted = false;

  constructor(private eventsService: EventsService, private planningService: PlanningService) {  }

  onPlanning(event: Event): void {
    if (event.planning) {
      this.planningDetails = event.planning;
      this.showPlanningDetailsModal = true;
    } else if (event.id != null) {
      this.planningService.getPlanningByEvent(event.id).subscribe({
        next: (planning) => {
          this.planningDetails = planning;
          this.showPlanningDetailsModal = true;
        },
        error: () => {
          this.planningDetails = null;
          this.showPlanningDetailsModal = true;
        }
      });
    } else {
      // Cas où event.id est undefined ou null
      this.planningDetails = null;
      this.showPlanningDetailsModal = true;
    }
  }

  closePlanningDetailsModal(): void {
    this.showPlanningDetailsModal = false;
    this.planningDetails = {};
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventsService.getEventsWithPlannings().subscribe(
      data => {
        console.log('Événements reçus:', data);
        this.events = data;

        // Essayer de récupérer les plannings pour chaque événement si nécessaire
        const eventIds = this.events
          .filter(event => !event.planning && event.id)
          .map(event => event.id as number);

        if (eventIds.length > 0) {
          console.log(`Recherche des plannings pour ${eventIds.length} événements`);
          this.loadPlanningsForEvents(eventIds);
        } else {
          this.filteredEvents = [...this.events];
          this.sortEvents();
        }
      },
      error => {
        console.error('Erreur lors du chargement des événements', error);
      }
    );
  }

  loadPlanningsForEvents(eventIds: number[]): void {
    // Utiliser forkJoin pour exécuter toutes les requêtes en parallèle
    const requests = eventIds.map(eventId => 
      this.planningService.getPlanningByEvent(eventId).pipe(
        catchError((err: any) => {
          console.warn(`Pas de planning trouvé pour l'événement ${eventId}:`, err);
          return of(null); // Retourner null en cas d'erreur pour ne pas bloquer les autres requêtes
        })
      )
    );

    // Si aucune requête à effectuer, on sort
    if (requests.length === 0) {
      this.filteredEvents = [...this.events];
      this.sortEvents();
      return;
    }

    forkJoin(requests).subscribe((plannings: any[]) => {
      // Associer chaque planning à son événement correspondant
      plannings.forEach((planning: any, index: number) => {
        if (planning) {
          const eventId = eventIds[index];
          const eventIndex = this.events.findIndex(e => e.id === eventId);
          
          if (eventIndex !== -1) {
            this.events[eventIndex].planning = planning;
            console.log(`Planning associé à l'événement ${eventId}:`, planning);
          }
        }
      });

      this.filteredEvents = [...this.events];
      this.sortEvents();
    });
  }

  // Méthode pour rechercher des événements
  searchEvents(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredEvents = [...this.events]; // Réinitialiser si terme de recherche vide
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredEvents = this.events.filter(event => 
        event.name?.toLowerCase().includes(term) || 
        event.description?.toLowerCase().includes(term)
      );
      
      console.log('Résultats de recherche:', this.filteredEvents.length);
    }
    
    // Appliquer le tri après la recherche
    this.sortEvents();
  }

  // Méthode appelée lorsque le terme de recherche change
  onSearchTermChange(): void {
    this.searchEvents();
  }

  refreshEventList() {
    this.eventsService.getEvents().subscribe((data) => {
      this.events = data;
      this.searchEvents(); // Réappliquer le filtre et le tri après rafraîchissement
    });
  }

  // Méthode pour changer le critère de tri
  setSortField(field: string): void {
    // Si on clique sur le même champ, inverser la direction du tri
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Sinon, définir le nouveau champ et réinitialiser la direction à ascendant
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    // Appliquer le tri
    this.sortEvents();
  }
  
  // Méthode pour trier les événements
  sortEvents(): void {
    // Faire une copie pour ne pas modifier l'ordre original lors de la recherche
    const sortedEvents = [...this.filteredEvents];
    
    sortedEvents.sort((a, b) => {
      let dateA: number = 0;
      let dateB: number = 0;
      
      // Accéder aux propriétés de manière sécurisée selon le champ de tri
      if (this.sortField === 'eventDate') {
        dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
        dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      } else if (this.sortField === 'registrationDeadline') {
        dateA = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : 0;
        dateB = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : 0;
      }
      
      // Comparer les dates selon la direction du tri
      if (this.sortDirection === 'asc') {
        return dateA - dateB; // Tri ascendant (du plus ancien au plus récent)
      } else {
        return dateB - dateA; // Tri descendant (du plus récent au plus ancien)
      }
    });
    
    // Mettre à jour les événements filtrés avec les événements triés
    this.filteredEvents = sortedEvents;
  }

  openEditModal(event: any) {
    // Clone l'événement pour éviter de modifier directement la liste
    this.selectedEvent = { ...event };
    
    // Réinitialiser les variables d'upload et de validation
    this.selectedFile = null;
    this.uploadError = null;
    this.isUploading = false;
    this.formErrors = {};
    this.submitted = false;
    
    // Formater les dates au format YYYY-MM-DD pour les champs input de type date
    if (this.selectedEvent.eventDate) {
      // Convertir la date en objet Date et la formater
      const eventDate = new Date(this.selectedEvent.eventDate);
      this.selectedEvent.eventDate = this.formatDateForInput(eventDate);
    }
    
    if (this.selectedEvent.registrationDeadline) {
      // Convertir la date en objet Date et la formater
      const registrationDate = new Date(this.selectedEvent.registrationDeadline);
      this.selectedEvent.registrationDeadline = this.formatDateForInput(registrationDate);
    }
    
    this.showEditModal = true;
  }
  
  // Méthode utilitaire pour formater une date au format YYYY-MM-DD
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    // Les mois sont indexés à partir de 0, donc on ajoute 1
    // On utilise padStart pour s'assurer d'avoir 2 chiffres
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        console.log('Fichier sélectionné:', this.selectedFile.name);
      }
    }
  }

  updateEvent() {
    // Valider le formulaire avant de procéder
    if (!this.validateForm()) {
      return; // Arrêter si le formulaire n'est pas valide
    }

    // Si un fichier a été sélectionné, d'abord uploader l'image
    if (this.selectedFile && this.selectedEvent.id) {
      this.isUploading = true;
      this.uploadError = null;
      
      this.eventsService.uploadEventImage(this.selectedEvent.id, this.selectedFile).subscribe(
        (imagePath) => {
          this.isUploading = false;
          console.log('Image uploadée avec succès', imagePath);
          
          // Mettre à jour l'événement avec le chemin de l'image
          this.selectedEvent.image = imagePath;
          this.saveEventChanges();
        },
        (error) => {
          this.isUploading = false;
          this.uploadError = 'Erreur lors de l\'upload de l\'image';
          console.error('Erreur lors de l\'upload de l\'image', error);
          
          // Continuer à sauvegarder l'événement sans l'image
          this.saveEventChanges();
        }
      );
    } else {
      // Pas de fichier à uploader, sauvegarder directement les modifications
      this.saveEventChanges();
    }
  }
  
  saveEventChanges() {
    // Créer une copie de l'événement à envoyer au backend
    const eventToUpdate = { ...this.selectedEvent };
    
    // Appeler le service pour mettre à jour l'événement
    this.eventsService.updateEvent(eventToUpdate).subscribe(
      (response) => {
        console.log('Événement mis à jour avec succès', response);
        this.showEditModal = false;
        this.refreshEventList(); // Mettre à jour la liste
      },
      (error) => {
        console.error('Erreur lors de la mise à jour', error);
      }
    );
  }

  deleteEvent(event: Event): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.name}" ?`)) {
      this.eventsService.deleteEvent(event.id!).subscribe(
        () => {
          console.log('Événement supprimé avec succès');
          this.refreshEventList();
        },
        (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      );
    }
  }

  // Méthode pour transformer le chemin d'image relatif en URL complète
  getImageUrl(imagePath: string): string {
    // Si l'image est déjà une URL complète (commence par http ou https), la retourner telle quelle
    if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    
    // Sinon, construire l'URL complète en ajoutant le chemin de base du serveur
    // Utilisez l'URL de votre serveur backend
    return `http://localhost:8085/ElitGo/${imagePath}`;
  }

  // Méthode pour valider le formulaire avant soumission
  validateForm(): boolean {
    this.formErrors = {};
    this.submitted = true;
    let isValid = true;
    
    console.log('Validation du formulaire de modification...');
    
    // Validation pour le nom
    if (!this.selectedEvent.name || this.selectedEvent.name.trim() === '') {
      this.formErrors['name'] = 'Le nom de l\'événement est obligatoire';
      isValid = false;
    } else if (this.selectedEvent.name.trim().length < 3) {
      this.formErrors['name'] = 'Le nom doit contenir au moins 3 caractères';
      isValid = false;
    }
    
    // Validation pour la description
    if (!this.selectedEvent.description || this.selectedEvent.description.trim() === '') {
      this.formErrors['description'] = 'La description est obligatoire';
      isValid = false;
    } else if (this.selectedEvent.description.trim().length < 10) {
      this.formErrors['description'] = 'La description doit contenir au moins 10 caractères';
      isValid = false;
    }
    
    // Validation pour l'image
    if (!this.selectedFile && !this.selectedEvent.image) {
      this.formErrors['image'] = 'Une image est requise pour l\'événement';
      isValid = false;
    }
    
    // Validation pour la date de l'événement
    if (!this.selectedEvent.eventDate) {
      this.formErrors['eventDate'] = 'La date de l\'événement est obligatoire';
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(this.selectedEvent.eventDate);
      
      console.log('Date de l\'événement:', eventDate);
      console.log('Date d\'aujourd\'hui:', today);
      
      if (eventDate < today) {
        this.formErrors['eventDate'] = 'La date de l\'événement doit être dans le futur';
        isValid = false;
      }
    }
    
    // Validation pour la date limite d'inscription
    if (!this.selectedEvent.registrationDeadline) {
      this.formErrors['registrationDeadline'] = 'La date limite d\'inscription est obligatoire';
      isValid = false;
    } else if (this.selectedEvent.eventDate) {
      const regDeadline = new Date(this.selectedEvent.registrationDeadline);
      const eventDate = new Date(this.selectedEvent.eventDate);
      
      console.log('Date limite d\'inscription:', regDeadline);
      console.log('Date de l\'événement pour comparaison:', eventDate);
      
      // Normaliser les dates pour comparer seulement les jours (sans les heures)
      regDeadline.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      // La date limite d'inscription doit être inférieure ou égale à la date de l'événement
      if (regDeadline.getTime() > eventDate.getTime()) {
        this.formErrors['registrationDeadline'] = 'La date limite d\'inscription doit être antérieure ou égale à la date de l\'événement';
        isValid = false;
      }
    }
    
    console.log('Formulaire de modification valide:', isValid);
    console.log('Erreurs:', this.formErrors);
    
    return isValid;
  }
}
