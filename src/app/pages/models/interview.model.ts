export interface Interview {
    id?: number;
    date: Date;
    status: 'Pending' | 'Passed' | 'Failed';
    score: number;
    meeting_link: string;
    extraBonus: number;
}
