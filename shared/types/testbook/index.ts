import { BaseEntity } from '../shared';

export interface Testbook extends BaseEntity {
  title: string;
  version: string;
  description: string;
  color: string;
  icon: string;
  isCustom: boolean;
  isPublic: boolean;
  sharedWith: string[];
  modules?: string[];
}

export interface Module extends BaseEntity {
  testbookId: string;
  title: string;
  content: string;
  orderIndex: number;
}
