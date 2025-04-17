import { Category } from './category';
export interface Formation {
    id: number;
    title: string;
    // Removed: progression: string;
    // Removed: video: string;
    // Removed: certificate: string;
    description: string;
    discount?: number;
    discountedPrice?: number;
    duration: string;
    featured: string;
    highestRated: string;
    image: string;
    label: string;
    price: number;
    ressources: Ressource[];
    quiz: Quiz;
    categoryName?: string; // Ajoutez cette propriété
    progress?: number;
    category?: Category;
}

export interface Ressource {
    id: number;
    type: string;
    title: string;
    fileUrl: string;
    description: string;
    completedByStudent: boolean;
    formationId: number;
}

export interface Quiz {
    idQuiz: number;
    title: string;
    description: string;
    duration: number;
    nbrquestions: number;
    categorie: string;
}

export interface QuizScore {
    idScore: number;
    score: number;
    date: Date;
    quizId: number;
    gradesId: number; // Assuming Grades represents the student or user
}

// Vous pouvez aussi ajouter d'autres relations, par exemple quiz ou resource, si besoin
