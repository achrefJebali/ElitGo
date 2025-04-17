import { Component, ViewChild } from '@angular/core';
import { latLng, tileLayer, MapOptions, LeafletMouseEvent, marker, Marker, icon, Map } from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { EventsService } from '../../services/events.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [DashboardHeaderComponent, CommonModule, FormsModule, LeafletModule],
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent {
  searchQuery: string = '';
  @ViewChild('eventForm') eventForm!: NgForm;
  
  event: Event = {
    location: '', // Initialisé à vide
  
    name: '',
    description: '',
    image: '',
    eventDate: '',
    registrationDeadline: '',
    planning: null,
    maxParticipants: undefined
  };
  
  selectedFile: File | null = null;
  showMapModal: boolean = false;
  mapInstance: Map | null = null;
  // Options pour la carte Leaflet
  options: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 6,
    center: latLng(36.8, 10.18), // Par défaut Tunis
    zoomControl: true // Affiche les boutons zoom +/-
  };

  mapMarker: Marker | null = null;
  mapLayers: any[] = [
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    })
  ];

  // Recherche d'adresse personnalisée (Nominatim)
  searchAddress() {
    if (!this.searchQuery || !this.mapInstance) return;
    const query = encodeURIComponent(this.searchQuery);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          this.mapInstance!.setView([lat, lon], 15);
          this.onMapClick({ latlng: { lat, lng: lon } }, false);
        } else {
          alert('No results found for this address.');
        }
      })
      .catch(() => alert('Error while searching for the address.'));
  }

  // Méthode appelée lors d'un clic sur la carte
  onMapClick(event: any, closeAfter: boolean = false) {
    if (event && event.latlng) {
      const { lat, lng } = event.latlng;
      this.event.location = `${lat},${lng}`;
      // Ajoute ou déplace le marqueur
      this.mapMarker = marker([lat, lng], {
        icon: icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      });
      this.mapLayers = [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        }),
        this.mapMarker
      ];
      if (closeAfter) {
        this.closeMapModal();
      }
    }
  }

  openMapModal() {
    this.showMapModal = true;
    setTimeout(() => {
      if (this.mapInstance) {
        this.mapInstance.invalidateSize();
      }
    }, 300);
  }

  closeMapModal() {
    this.showMapModal = false;
  }

  // Récupère l'instance de la carte Leaflet
  onMapReady(map: Map) {
    this.mapInstance = map;
    setTimeout(() => {
      this.mapInstance?.invalidateSize();
    }, 300);

    // Ajout du contrôle de recherche Leaflet Control Geocoder
    if ((window as any).L && (window as any).L.Control && (window as any).L.Control.Geocoder) {
      const geocoder = (window as any).L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: 'Rechercher un lieu...',
        errorMessage: 'Aucun résultat trouvé'
      })
      .on('markgeocode', (e: any) => {
        const latlng = e.geocode.center;
        if (this.mapInstance) {
          this.mapInstance.setView(latlng, 15);
        }
        this.onMapClick({ latlng }, false);
      })
      .addTo(this.mapInstance);
    }
  }

  uploadError: string | null = null;
  isUploading: boolean = false;
  formErrors: { [key: string]: string } = {};
  submitted = false;

  constructor(private eventsService: EventsService) {}

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        console.log('Fichier sélectionné:', this.selectedFile.name);
      }
    }
  }

  validateForm(): boolean {
    this.formErrors = {};
    this.submitted = true;
    let isValid = true;
    
    console.log('Validation du formulaire...');
    
    // Validation for name field
    if (!this.event.name || this.event.name.trim() === '') {
      this.formErrors['name'] = 'Le nom de l\'événement est obligatoire';
      isValid = false;
    } else if (this.event.name.trim().length < 3) {
      this.formErrors['name'] = 'Le nom doit contenir au moins 3 caractères';
      isValid = false;
    }
    
    // Validation for description field
    if (!this.event.description || this.event.description.trim() === '') {
      this.formErrors['description'] = 'La description est obligatoire';
      isValid = false;
    } else if (this.event.description.trim().length < 10) {
      this.formErrors['description'] = 'La description doit contenir au moins 10 caractères';
      isValid = false;
    }
    
    // Validation for image
    if (!this.selectedFile && !this.event.image) {
      this.formErrors['image'] = 'Une image est requise pour l\'événement';
      isValid = false;
    }
    
    // Validation for event date
    if (!this.event.eventDate) {
      this.formErrors['eventDate'] = 'La date de l\'événement est obligatoire';
      isValid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(this.event.eventDate);
      
      console.log('Date de l\'événement:', eventDate);
      console.log('Date d\'aujourd\'hui:', today);
      
      if (eventDate < today) {
        this.formErrors['eventDate'] = 'La date de l\'événement doit être dans le futur';
        isValid = false;
      }
    }
    
    // Validation for maxparticipants
    if (this.event.maxParticipants === undefined || this.event.maxParticipants < 1) {
      this.formErrors['maxParticipants'] = 'Le nombre maximum de participants est obligatoire et doit être supérieur à zéro';
      isValid = false;
    }

    // Validation for location
    if (!this.event.location || this.event.location.trim() === '') {
      this.formErrors['location'] = 'Location is required';
      isValid = false;
    }

    // Validation for registration deadline
    if (!this.event.registrationDeadline) {
      this.formErrors['registrationDeadline'] = 'Registration deadline is required';
      isValid = false;
    } else if (this.event.eventDate) {
      const regDeadline = new Date(this.event.registrationDeadline);
      const eventDate = new Date(this.event.eventDate);
      
      console.log('Date limite d\'inscription:', regDeadline);
      console.log('Date de l\'événement pour comparaison:', eventDate);
      
      // Normaliser les dates pour comparer seulement les jours (sans les heures)
      regDeadline.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      // Correction: La date limite d'inscription doit être inférieure ou égale à la date de l'événement
      if (regDeadline.getTime() > eventDate.getTime()) {
        this.formErrors['registrationDeadline'] = 'Registration deadline must be before or equal to the event date';
        isValid = false;
      }
    }
    
    console.log('Formulaire valide:', isValid);
    console.log('Erreurs:', this.formErrors);
    
    return isValid;
  }

  onSubmit() {
    this.submitted = true;
    console.log('Form submitted', this.event);
    
    if (!this.validateForm()) {
      console.log('Validation errors:', this.formErrors);
      return;
    }
    
    console.log('Form is valid, sending to server:', this.event);
    
    // Ajouter l'événement d'abord
    this.eventsService.addEvent(this.event).subscribe({
      next: (createdEvent) => {
        console.log('Event added successfully', createdEvent);
        
        // Si nous avons un fichier sélectionné et que l'événement a un ID, uploader l'image
        if (this.selectedFile && createdEvent.id) {
          this.isUploading = true;
          this.uploadError = null;
          
          this.eventsService.uploadEventImage(createdEvent.id, this.selectedFile).subscribe({
            next: (imagePath) => {
              this.isUploading = false;
              console.log('Image uploaded successfully', imagePath);
              
              // Mettre à jour l'événement avec le chemin de l'image
              const updatedEvent = { ...createdEvent, image: imagePath };
              this.eventsService.updateEvent(updatedEvent).subscribe({
                next: (eventResult) => {
                  console.log('Event updated with image', eventResult);
                  alert('Event added successfully!');
                  this.resetForm();
                },
                error: (updateError) => {
                  console.error('Error updating event with image', updateError);
                  alert('Event added, but there was an error updating the image');
                }
              });
            },
            error: (uploadError) => {
              this.isUploading = false;
              this.uploadError = 'Error uploading image';
              console.error('Error uploading image', uploadError);
              alert('Event added, but there was an error uploading the image');
            }
          });
        } else {
          alert('Event added successfully!');
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Error adding event', error);
        alert('Error adding event');
      }
    });
  }

  resetForm() {
    this.event = {
      name: '',
      description: '',
      image: '',
      eventDate: '',
      registrationDeadline: '',
      planning: null,
      maxParticipants: undefined
    };
    this.selectedFile = null;
    this.uploadError = null;
    this.isUploading = false;
    this.formErrors = {};
    this.submitted = false;
    
    if (this.eventForm) {
      this.eventForm.resetForm();
    }
  }
}
