import type { AtlasPage, AtlasWorkspace } from "./platform";

export interface LegacyPageCompatibility {
  ownerId?: string;
  createdBy?: string;
  updatedBy?: string;
  legacyType?: string;
  source?: string;
}

export interface LegacyWorkspaceCompatibility {
  ownerId?: string;
  tenantId?: string;
  legacyKey?: string;
}

export function mapLegacyPageToAtlasPage(page: Record<string, unknown>, fallbackWorkspaceId = "default"): AtlasPage {
  const basePage = page as Partial<AtlasPage> & LegacyPageCompatibility;

  return {
    id: (basePage.id as string) ?? `page-${Date.now()}`,
    workspaceId: (basePage.workspaceId as string) ?? fallbackWorkspaceId,
    title: (basePage.title as string) ?? "Untitled Page",
    slug: (basePage.slug as string) ?? "untitled-page",
    type: (basePage.type as AtlasPage["type"]) ?? "custom",
    layout: (basePage.layout as AtlasPage["layout"]) ?? { rows: [] },
    widgets: (basePage.widgets as AtlasPage["widgets"]) ?? [],
    settings: (basePage.settings as AtlasPage["settings"]) ?? {},
    filters: (basePage.filters as AtlasPage["filters"]) ?? {},
    sorting: (basePage.sorting as AtlasPage["sorting"]) ?? {},
    tabs: (basePage.tabs as AtlasPage["tabs"]) ?? [],
    expandedSections: (basePage.expandedSections as AtlasPage["expandedSections"]) ?? [],
    collapsedSections: (basePage.collapsedSections as AtlasPage["collapsedSections"]) ?? [],
    themeOverrides: (basePage.themeOverrides as AtlasPage["themeOverrides"]) ?? {},
    favoriteWidgets: (basePage.favoriteWidgets as AtlasPage["favoriteWidgets"]) ?? [],
    localPreferences: (basePage.localPreferences as AtlasPage["localPreferences"]) ?? {},
    createdAt: basePage.createdAt ?? new Date().toISOString(),
    updatedAt: basePage.updatedAt ?? new Date().toISOString(),
    ownerId: basePage.ownerId,
    createdBy: basePage.createdBy,
    updatedBy: basePage.updatedBy,
    legacyType: basePage.legacyType,
    source: basePage.source,
  } as AtlasPage & LegacyPageCompatibility;
}

export function mapLegacyWorkspaceToAtlasWorkspace(workspace: Record<string, unknown>): AtlasWorkspace {
  const baseWorkspace = workspace as Partial<AtlasWorkspace> & LegacyWorkspaceCompatibility;

  return {
    id: (baseWorkspace.id as string) ?? `workspace-${Date.now()}`,
    name: (baseWorkspace.name as string) ?? "Unnamed Workspace",
    companyId: (baseWorkspace.companyId as string) ?? "default-company",
    modules: (baseWorkspace.modules as AtlasWorkspace["modules"]) ?? [],
    themeOverrides: (baseWorkspace.themeOverrides as AtlasWorkspace["themeOverrides"]) ?? {},
    settings: (baseWorkspace.settings as AtlasWorkspace["settings"]) ?? {},
    createdAt: baseWorkspace.createdAt ?? new Date().toISOString(),
    updatedAt: baseWorkspace.updatedAt ?? new Date().toISOString(),
    ownerId: baseWorkspace.ownerId,
    tenantId: baseWorkspace.tenantId,
    legacyKey: baseWorkspace.legacyKey,
  } as AtlasWorkspace & LegacyWorkspaceCompatibility;
}
