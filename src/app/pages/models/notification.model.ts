export interface Notification {
  id?: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  relatedEntityId?: number; // Could be an interview ID, course ID, etc.
  relatedEntityType?: string; // Could be "INTERVIEW", "COURSE", etc.
}

export enum NotificationType {
  INTERVIEW = 'INTERVIEW',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  COURSE = 'COURSE',
  SYSTEM = 'SYSTEM'
}
