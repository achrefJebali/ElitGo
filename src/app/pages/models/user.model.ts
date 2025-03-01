//./models/user.model.ts
export interface User {
    id?: number;
    name: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    address: string;
    photo: string;
    status: string;
    balance: number;
    role: string;
    token: string;
    isPaid: boolean;
    weeklyInterviews: number;
  }
  