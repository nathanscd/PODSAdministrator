import { BaseEntity } from '../shared';

export interface DailyGoal extends BaseEntity {
  text: string;
  completed: boolean;
  assignedTo?: string | null;
  assignedName?: string | null;
}

export interface QuickTask extends BaseEntity {
  text: string;
  ownerId: string;
  assignedTo?: string | null;
  assignedName?: string | null;
}
