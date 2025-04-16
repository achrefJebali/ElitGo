import { Question } from "./question.model";

export interface Quiz {
  categories: string;
  quizId: number;
  title: string;
  description?: string;
  duration?: number;
  nbrquestions?: number;
  questions?: Question[];
}
