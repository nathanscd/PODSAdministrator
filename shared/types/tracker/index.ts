import { BaseEntity } from '../shared';

export interface TaskTrackerTask {
  id: string;
  task: string;
  status: string;
  plannedEndDate?: string;
}

export interface TaskTracker extends BaseEntity {
  title: string;
  ownerId: string;
  tasks?: TaskTrackerTask[];
}
