export interface ClubMember {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    phoneNumber?: string;
    quizScore?: number;
    submissionDate?: string;
    status?: 'active' | 'inactive';
}
