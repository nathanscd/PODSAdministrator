import { BaseEntity, Theme } from '../index';

export interface Company extends BaseEntity {
  name: string;
  slug: string;
  logoUrl?: string;
  settings?: Record<string, any>;
}

export interface Workspace extends BaseEntity {
  companyId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Department extends BaseEntity {
  companyId: string;
  workspaceId?: string;
  name: string;
  code: string;
}

export interface Team extends BaseEntity {
  departmentId: string;
  name: string;
  members: string[]; // User UIDs
}

export interface TenantRole extends BaseEntity {
  companyId?: string;
  name: string;
  permissions: string[];
}

export interface TenantUser extends BaseEntity {
  email: string;
  displayName: string;
  photoURL?: string;
  photoUrl?: string;
  companyId?: string;
  workspaceIds?: string[];
  departmentId?: string;
  teamIds?: string[];
  role: string;
  roles?: string[];
  theme: Theme;
  technicalSalesGroup?: string;
  isAdmin?: boolean;
  language?: string;
  bio: string;
}

export type UserProfile = TenantUser;
