import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClubsService } from '../../../services/clubs.service';
import { Club } from '../../../models/club.model';
import { ClubMember } from '../../../models/club-member.model';
import { ClubMembersService } from '../../../services/club-members.service';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-showclub-back',
  templateUrl: './showclub-back.component.html',
  styleUrls: ['./showclub-back.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardHeaderComponent
  ]
})
export class ShowclubBackComponent implements OnInit {
  clubs: Club[] = [];
  filteredClubs: Club[] = []; // Pour stocker les clubs filtrés
  searchTerm: string = ''; // Pour stocker le terme de recherche
  showEditModal = false;
  showMembersModal = false; // Pour afficher/masquer le modal des membres
  clubMembers: ClubMember[] = []; // Pour stocker les membres du club
  filteredMembers: ClubMember[] = []; // Pour stocker les membres filtrés
  memberSearchTerm: string = ''; // Terme de recherche pour les membres
  currentSortField: string = ''; // Champ de tri actuel
  sortDirection: 'asc' | 'desc' = 'asc'; // Direction de tri
  loading: boolean = false; // État de chargement
  selectedClub: Club = {
    name: '',
    email: '',
    theme: '',
    description: '',
    objectives: '',
    image: '',
    events: []
  };

  // Propriétés pour la gestion de l'upload d'image
  selectedFile: File | null = null;
  uploadError: string | null = null;
  isUploading: boolean = false;

  constructor(
    private clubsService: ClubsService,
    private clubMembersService: ClubMembersService
  ) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.clubsService.getClubs().subscribe({
      next: (data) => {
        console.log('Clubs chargés:', data);
        this.clubs = data;
        this.filteredClubs = data; // Initialiser également les clubs filtrés
      },
      error: (error) => {
        console.error('Erreur lors du chargement des clubs:', error);
      }
    });
  }

  // Méthode pour rechercher des clubs
  searchClubs(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredClubs = [...this.clubs]; // Réinitialiser si terme de recherche vide
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredClubs = this.clubs.filter(club => 
      club.name?.toLowerCase().includes(term) || 
      club.description?.toLowerCase().includes(term) ||
      club.theme?.toLowerCase().includes(term) ||
      club.email?.toLowerCase().includes(term)
    );
    
    console.log('Résultats de recherche:', this.filteredClubs.length);
  }

  // Méthode appelée lorsque le terme de recherche change
  onSearchTermChange(): void {
    this.searchClubs();
  }

  openEditModal(club: Club): void {
    console.log('Opening modal for club:', club);
    this.selectedClub = { ...club }; // Copie pour éviter la modification directe
    
    // Réinitialiser les variables d'upload
    this.selectedFile = null;
    this.uploadError = null;
    this.isUploading = false;
    
    this.showEditModal = true;
    console.log('Modal state:', this.showEditModal);
    console.log('Selected club:', this.selectedClub);
  }

  closeModal(): void {
    this.showEditModal = false;
  }
  
  // Méthode pour gérer la sélection de fichier
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        console.log('Fichier sélectionné:', this.selectedFile.name);
      }
    }
  }

  updateClub(): void {
    if (this.selectedClub.id) {
      console.log('Mise à jour du club:', this.selectedClub);
      
      // Si un fichier a été sélectionné, d'abord uploader l'image
      if (this.selectedFile) {
        this.isUploading = true;
        this.uploadError = null;
        
        this.clubsService.uploadClubImage(this.selectedClub.id, this.selectedFile).subscribe({
          next: (imagePath) => {
            this.isUploading = false;
            console.log('Image uploadée avec succès', imagePath);
            
            // Mettre à jour le club avec le chemin de l'image
            this.selectedClub.image = imagePath;
            this.saveClubChanges();
          },
          error: (error) => {
            this.isUploading = false;
            this.uploadError = 'Erreur lors de l\'upload de l\'image';
            console.error('Erreur lors de l\'upload de l\'image', error);
            
            // Continuer à sauvegarder le club sans l'image
            this.saveClubChanges();
          }
        });
      } else {
        // Pas de fichier à uploader, sauvegarder directement les modifications
        this.saveClubChanges();
      }
    }
  }
  
  saveClubChanges(): void {
    // Appeler le service pour mettre à jour le club
    this.clubsService.updateClub(this.selectedClub).subscribe({
      next: (updatedClub) => {
        console.log('Club mis à jour avec succès:', updatedClub);
        // Mettre à jour le club dans la liste locale
        const index = this.clubs.findIndex(c => c.id === this.selectedClub.id);
        if (index !== -1) {
          this.clubs[index] = updatedClub;
        }
        this.closeModal();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du club:', error);
      }
    });
  }

  deleteClub(clubId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) {
      this.clubsService.deleteClub(clubId).subscribe({
        next: () => {
          console.log('Club supprimé avec succès');
          this.clubs = this.clubs.filter(c => c.id !== clubId);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du club:', error);
        }
      });
    }
  }
  
  // Méthode pour ouvrir le modal des membres
  openMembersModal(club: Club): void {
    console.log('Ouverture du modal des membres pour le club:', club);
    this.selectedClub = { ...club }; // Copie pour éviter la modification directe
    this.loading = true;
    this.clubMembers = [];
    this.filteredMembers = [];
    this.memberSearchTerm = '';
    this.currentSortField = '';
    this.sortDirection = 'asc';
    this.showMembersModal = true;
    
    // Ajouter une classe au body pour éviter le défilement
    document.body.classList.add('overflow-hidden');
    
    // Attendre que le modal soit rendu puis ajuster les propriétés CSS directement
    setTimeout(() => {
      const modalElement = document.querySelector('.members-fullscreen-modal') as HTMLElement;
      if (modalElement) {
        modalElement.style.position = 'fixed';
        modalElement.style.top = '0';
        modalElement.style.left = '0';
        modalElement.style.width = '100vw';
        modalElement.style.height = '100vh';
        modalElement.style.zIndex = '9999';
        modalElement.style.backgroundColor = '#fff';
        modalElement.style.overflow = 'auto';
        modalElement.style.display = 'block';
      }
    }, 0);
    
    // Charger les membres du club
    if (club.id) {
      this.clubMembersService.getClubMembers(club.id).subscribe({
        next: (members) => {
          console.log('Membres chargés:', members);
          this.clubMembers = members;
          this.filteredMembers = [...members]; // Initialiser les membres filtrés
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des membres:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
  
  // Rechercher des membres
  searchMembers(): void {
    if (!this.memberSearchTerm || this.memberSearchTerm.trim() === '') {
      this.filteredMembers = [...this.clubMembers];
      return;
    }
    
    const term = this.memberSearchTerm.toLowerCase().trim();
    this.filteredMembers = this.clubMembers.filter(member => 
      (member.nom?.toLowerCase().includes(term)) || 
      (member.prenom?.toLowerCase().includes(term)) || 
      (member.email?.toLowerCase().includes(term))
    );
    
    console.log(`Recherche de membres: ${term}, Résultats: ${this.filteredMembers.length}`);
  }
  
  // Trier les membres
  sortMembers(field: string): void {
    console.log(`Tri des membres par: ${field}`);
    
    // Si on clique sur le même champ, inverser la direction du tri
    if (this.currentSortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortField = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredMembers.sort((a, b) => {
      let aValue = a[field as keyof ClubMember];
      let bValue = b[field as keyof ClubMember];
      
      // Gestion des valeurs null/undefined
      if (aValue === undefined || aValue === null) return this.sortDirection === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return this.sortDirection === 'asc' ? 1 : -1;
      
      // Comparaison des valeurs
      if (typeof aValue === 'string') {
        aValue = (aValue as string).toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Obtenir le compte des membres avec un score dans une plage donnée
  getScoreCount(min: number, max: number): number {
    return this.clubMembers.filter(member => 
      member.quizScore !== undefined && 
      member.quizScore >= min && 
      member.quizScore <= max
    ).length;
  }
  
  // Formater la date pour l'affichage
  formatDate(dateStr: string): string {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateStr).toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateStr;
    }
  }
  
  // Méthode pour fermer le modal des membres
  closeMembersModal(): void {
    this.showMembersModal = false;
    // Restaurer le défilement du body
    document.body.classList.remove('overflow-hidden');
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

  refreshClubList() {
    this.clubsService.getClubs().subscribe({
      next: (data) => {
        this.clubs = data;
        this.searchClubs(); // Réappliquer le filtre après rafraîchissement
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement des clubs:', error);
      }
    });
  }
}
