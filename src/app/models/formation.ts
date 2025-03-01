import { Category } from './category';
export interface Formation {
    id: number;
    title: string;
    certificate: string;
    description: string;
    discount: string;
    duration: string;
    featured: string;
    highestRated: string;
    image: string;
    label: string;
    price: number;
    progression: string;
    video: string;
    categoryName?: string; // Ajoutez cette propriété

    category?: Category;
    // Vous pouvez aussi ajouter d'autres relations, par exemple quiz ou resource, si besoin
}