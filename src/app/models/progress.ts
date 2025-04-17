export interface Progress {
    id?: number;
    progressPercentage: number;
    videosCompleted: boolean;
    quizScore?: number;
    lastUpdated?: string;
    user?: { id: number;[key: string]: any }; // Add user field with minimal structure
    formation?: { id: number;[key: string]: any }; // Add formation field with minimal structure
}