import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClubsService } from '../../../services/clubs.service';
import { Club } from '../../../models/club.model';
import { DashboardHeaderComponent } from '../../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-add-club',
  templateUrl: './add-club.component.html',
  styleUrls: ['./add-club.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardHeaderComponent
  ]
})
export class AddClubComponent {
  club: Club = {
    name: '',
    email: '',
    theme: '',
    description: '',
    objectives: '',
    image: '',
    events: []
  };
  
  // Propriétés pour la gestion d'upload
  selectedFile: File | null = null;
  uploadError: string | null = null;
  isUploading: boolean = false;
  
  // Propriétés pour la validation du formulaire
  formErrors: any = {};
  submitted: boolean = false;

  constructor(private clubsService: ClubsService) {}

  // Méthode pour gérer la sélection de fichier
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        console.log('Fichier sélectionné:', this.selectedFile.name);
      }
    }
  }
  
  // Méthode pour valider le formulaire
  validateForm(): boolean {
    this.formErrors = {};
    this.submitted = true;
    let isValid = true;
    
    console.log('Validation du formulaire du club...');
    
    // Validation du nom
    if (!this.club.name || this.club.name.trim() === '') {
      this.formErrors['name'] = 'Le nom du club est obligatoire';
      isValid = false;
    } else if (this.club.name.trim().length < 3) {
      this.formErrors['name'] = 'Le nom doit contenir au moins 3 caractères';
      isValid = false;
    }
    
    // Validation de la description
    if (!this.club.description || this.club.description.trim() === '') {
      this.formErrors['description'] = 'La description est obligatoire';
      isValid = false;
    } else if (this.club.description.trim().length < 10) {
      this.formErrors['description'] = 'La description doit contenir au moins 10 caractères';
      isValid = false;
    }
    
    // Validation des objectifs
    if (!this.club.objectives || this.club.objectives.trim() === '') {
      this.formErrors['objectives'] = 'Les objectifs sont obligatoires';
      isValid = false;
    } else if (this.club.objectives.trim().length < 10) {
      this.formErrors['objectives'] = 'Les objectifs doivent contenir au moins 10 caractères';
      isValid = false;
    }
    
    // Validation du thème
    if (!this.club.theme || this.club.theme.trim() === '') {
      this.formErrors['theme'] = 'Le thème est obligatoire';
      isValid = false;
    } else if (this.club.theme.trim().length < 2) {
      this.formErrors['theme'] = 'Le thème doit contenir au moins 2 caractères';
      isValid = false;
    }
    
    // Validation de l'email
    if (!this.club.email || this.club.email.trim() === '') {
      this.formErrors['email'] = 'L\'email est obligatoire';
      isValid = false;
    } else {
      // Valider le format de l'email
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.club.email)) {
        this.formErrors['email'] = 'Veuillez entrer une adresse email valide';
        isValid = false;
      }
    }
    
    // Validation de l'image
    if (!this.selectedFile && !this.club.image) {
      this.formErrors['image'] = 'Une image est requise pour le club';
      isValid = false;
    }
    
    console.log('Formulaire valide:', isValid);
    console.log('Erreurs:', this.formErrors);
    
    return isValid;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      console.log('Formulaire invalide, soumission annulée');
      return;
    }
    
    console.log('Soumission du club:', this.club);
    
    // Ajouter d'abord le club pour obtenir son ID
    this.clubsService.addClub(this.club).subscribe({
      next: (createdClub) => {
        console.log('Club ajouté avec succès:', createdClub);
        
        // Si un fichier a été sélectionné, uploader l'image
        if (this.selectedFile && createdClub.id) {
          this.isUploading = true;
          this.uploadError = null;
          console.log('Début de l\'upload de l\'image pour le club ID:', createdClub.id);
          
          this.clubsService.uploadClubImage(createdClub.id, this.selectedFile).subscribe(
            (imagePath) => {
              this.isUploading = false;
              console.log('Image uploadée avec succès. Chemin reçu:', imagePath);
              console.log('Type de donnée du chemin:', typeof imagePath);
              
              // S'assurer que l'image est une chaîne de caractères non vide
              if (imagePath && typeof imagePath === 'string') {
                // Mettre à jour le club avec le chemin de l'image
                const updatedClub = { 
                  ...createdClub, 
                  image: imagePath.trim() // Assurez-vous qu'il n'y a pas d'espaces inutiles
                };
                
                console.log('Club à mettre à jour avec l\'image:', updatedClub);
                
                this.clubsService.updateClub(updatedClub).subscribe(
                  (response) => {
                    console.log('Club mis à jour avec l\'image:', response);
                    if (response.image) {
                      console.log('Vérification du chemin d\'image enregistré:', response.image);
                    } else {
                      console.warn('Attention: Le chemin d\'image n\'est pas présent dans la réponse!');
                    }
                    alert('Club ajouté avec succès!');
                    this.resetForm();
                  },
                  (error) => {
                    console.error('Erreur lors de la mise à jour du club avec l\'image:', error);
                    alert('Club ajouté, mais erreur lors de la mise à jour de l\'image.');
                    this.resetForm();
                  }
                );
              } else {
                console.error('Chemin d\'image invalide reçu:', imagePath);
                alert('Club ajouté, mais le chemin d\'image est invalide.');
                this.resetForm();
              }
            },
            (error) => {
              this.isUploading = false;
              this.uploadError = 'Erreur lors de l\'upload de l\'image';
              console.error('Erreur lors de l\'upload de l\'image:', error);
              alert('Club ajouté, mais erreur lors de l\'upload de l\'image.');
              this.resetForm();
            }
          );
        } else {
          // Pas d'upload d'image nécessaire
          alert('Club ajouté avec succès!');
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du club:', error);
        alert('Erreur lors de l\'ajout du club.');
      }
    });
  }
  
  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.club = {
      name: '',
      email: '',
      theme: '',
      description: '',
      objectives: '',
      image: '',
      events: []
    };
    this.selectedFile = null;
    this.uploadError = null;
    this.isUploading = false;
  }
}
