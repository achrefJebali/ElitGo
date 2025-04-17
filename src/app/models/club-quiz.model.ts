export interface ClubQuiz {
    id?: number;
    title: string;
    description: string;
    passingScore: number;
    club?: any;
    questions?: ClubQuizQuestion[];
}

export interface ClubQuizQuestion {
    id?: number;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    points: number;
    quiz?: ClubQuiz;
}

export interface ClubQuizSubmission {
    id?: number;
    submissionDate: Date;
    score: number;
    passed: boolean;
    answers: {[key: number]: number};
    quiz?: ClubQuiz;
    user?: any;
}

export interface QuizSubmitRequest {
    userId: number;
    quizId: number;
    answers: {[key: number]: number};
}
