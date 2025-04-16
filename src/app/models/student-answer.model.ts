export interface StudentAnswer {
  id: number;
  answer: string;
  answerTime: string; // Utilisez `string` pour simplifier la gestion des dates dans Angular
  question: Question;
}

export interface Question {
  question_id: number;
  text: string;
  difficulty: string;
  choices: string[];
  correctAnswer: string;
}