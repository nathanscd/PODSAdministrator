export type Role = 'ADMIN' | 'MANAGER' | 'USER' | 'CRAWLER';
export type Theme = 'light-orange' | 'light-rosa' | 'light-roxo' | 'light-vermelho' | 'dark-orange' | 'dark-rosa' | 'dark-roxo' | 'dark-vermelho';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export interface Translation {
  id: string;
  language: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'info' | 'assignment' | 'alert';
  read: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface SystemLog {
  id: string;
  action: string;
  detail: string;
  userId?: string | null;
  createdAt: Date;
}
