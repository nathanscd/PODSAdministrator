import { BaseEntity } from '../index';

export interface WorkspaceNavItem {
  id: string;
  label: string;
  icon?: string;
  path: string;
  moduleId?: string;
  badge?: string | number;
  isPinned?: boolean;
  isFavorite?: boolean;
}

export interface WorkspaceConfig extends BaseEntity {
  companyId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  installedModules?: string[];
  settings?: Record<string, any>;
}

export interface UserFavorite extends BaseEntity {
  userId: string;
  targetType: 'page' | 'testbook' | 'route';
  targetId: string;
  title: string;
  path: string;
}
