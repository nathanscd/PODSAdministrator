export interface AtlasEntity {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  ownerId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AtlasCompany extends AtlasEntity {
  name: string;
  departments?: string[];
  teams?: string[];
  employees?: string[];
  templateId?: string;
}

export interface AtlasWorkspace extends AtlasEntity {
  name: string;
  companyId: string;
  modules: string[];
  themeOverrides?: Record<string, string>;
  settings?: Record<string, unknown>;
}

export interface AtlasPageLayout {
  rows: Array<{
    id: string;
    columns: Array<{ id: string; widgetId?: string; span?: number }>;
  }>;
}

export interface AtlasWidget extends AtlasEntity {
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimumSize?: { width: number; height: number };
  maximumSize?: { width: number; height: number };
  permissions?: string[];
  configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  visibility?: { hidden?: boolean; roles?: string[] };
  version: number;
  dataBinding?: string;
}

export interface AtlasWidgetDefinition {
  type: string;
  displayName: string;
  description: string;
  defaultSize: { width: number; height: number };
  minimumSize: { width: number; height: number };
  maximumSize: { width: number; height: number };
}

export interface AtlasPage extends AtlasEntity {
  workspaceId: string;
  title: string;
  slug: string;
  type: 'dashboard' | 'workspace' | 'document' | 'board' | 'custom';
  layout: AtlasPageLayout;
  widgets: AtlasWidget[];
  settings?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  sorting?: Record<string, unknown>;
  tabs?: string[];
  expandedSections?: string[];
  collapsedSections?: string[];
  themeOverrides?: Record<string, string>;
  favoriteWidgets?: string[];
  localPreferences?: Record<string, unknown>;
}

export interface AtlasModuleDefinition {
  key: string;
  name: string;
  description: string;
  enabledByDefault: boolean;
  routes?: string[];
  widgets?: string[];
}
