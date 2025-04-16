// src/app/models/triche-detection.model.ts
import { Quiz } from './quiz.model';
import { StudentAnswer } from './student-answer.model';

export interface TricheDetection {
  id: number;
  date: Date; // Date de détection
  details: string; // Détails de la détection
  quiz: Quiz; // Relation avec le quiz
  studentAnswer: StudentAnswer; // Relation avec la réponse de l'étudiant
}