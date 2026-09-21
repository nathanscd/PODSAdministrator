import { BaseEntity } from '../shared';

export type WidgetType = 
  | 'calendar' 
  | 'kanban' 
  | 'richtext' 
  | 'metrics' 
  | 'chart' 
  | 'activity' 
  | 'tasks' 
  | 'documents' 
  | 'comments' 
  | 'timeline' 
  | 'database';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  order: number;
  width: 'full' | 'half' | 'third';
  settings?: Record<string, any>;
}

export interface PageInstanceCustomization extends BaseEntity {
  pageId: string;
  userId: string;
  workspaceId: string;
  widgets: WidgetConfig[];
  layoutSettings?: Record<string, any>;
}
