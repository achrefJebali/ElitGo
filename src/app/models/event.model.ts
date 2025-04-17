export interface Event {
  id?: number;  // Marque l'ID comme optionnel
  name: string;
  description: string;
  image: string;
  eventDate: string;  // ou Date si tu préfères
  registrationDeadline: string;
  planning: any;  // ou mieux définir le type pour "planning"
  maxParticipants?: number; // Nombre maximum de participants
  location?: string; // Localisation de l'événement (ex: "lat,lng")
  currentParticipants?: number; // Nombre actuel de participants
}
