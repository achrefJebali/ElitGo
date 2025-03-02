//./models/user.model.ts
export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN_CLUB = 'ADMIN CLUB',
  ADMIN = 'ADMIN'
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: Role;
  name?: string;
  phone?: string;
  address?: string;
  photo?: string; // URL to the stored photo
}