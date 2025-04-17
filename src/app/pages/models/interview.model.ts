// User object type for nested student/teacher in interview
export interface UserRef {
    id: number;
    name?: string;
    username?: string;
}

export interface Interview {
    id?: number;
    date: Date;
    meeting_link: string;
    studentId?: number | null;
    teacherId?: number | null;
    studentName?: string;
    teacherName?: string;
    notes?: string;
    duration?: number; // in minutes
    feedback?: string;
    score?: number; // Interview score
    extraBonus?: number; // Additional bonus points
    // Nested objects for student/teacher (from API response)
    student?: UserRef;
    teacher?: UserRef;
}
