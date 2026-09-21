import { BaseEntity } from '../shared';

export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  date: string;
  time?: string;
  link?: string;
  assignedTo?: string | null;
  assignedName?: string | null;
  ownerId?: string;
  type?: string;
}
