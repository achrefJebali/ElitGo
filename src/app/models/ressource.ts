export interface Ressource {
  id: number;
  type: string;
  title: string;
  fileUrl: string;
  description: string;
  completedByStudent: boolean;
  formation?: any;
  formationId?: number;
}
