export interface Quiz {
  quizId: number;
  title?: string;
  description?: string;
}

export interface Question {
  question_id?: number;
  text: string;
  difficulty: string;
  choices: string[];
  correctAnswer: string;
  imageUrl?: string;
  quizId: {
    quizId: number;
    title?: string;
  };
}

export enum Difficulty {
  easy = 'easy',
  midium = 'midium',
  hard = 'hard'
}