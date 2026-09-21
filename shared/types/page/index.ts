import { BaseEntity } from '../shared';

export interface Page extends BaseEntity {
  title: string;
  slug: string;
  type?: string;
  content?: string;
  widgets?: any[];
  tasks?: Record<string, any>;
}
