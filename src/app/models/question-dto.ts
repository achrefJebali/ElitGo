export interface QuestionDTO {
    question_id: number;  // Add this field to match the Question interface
    text: string;
    difficulty: string;  // Or use an enum for better handling of difficulties
    choices: string[];
    correctAnswer: string;
    imageUrl :string ;
  }
  
export enum Difficulty {
    easy = 'easy',
    midium = 'midium',
    hard = 'hard'
  }