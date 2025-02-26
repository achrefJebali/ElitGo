import { Feedback } from './feedback'; 
import { Comment } from './comment'; 
import { User } from './user'; 

export interface Announcement {
  id: number; // Facultatif car généré par la BDD
  posttitle: string;
  postslug: string;  // Ajout du champ postslug ici
  postimage: string;
  postdesc: string;
  creatdate: Date;
  feedbacks?: Feedback[]; // Facultatif
  comments?: Comment[];   // Facultatif
  users?: User[];         // Facultatif

}
