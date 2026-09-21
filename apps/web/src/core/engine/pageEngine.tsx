import { useMemo, type ReactNode } from "react";
import { widgetRegistry } from "../registry/widgetRegistry";
import type { AtlasPage, AtlasWidget } from "../types/platform";

export function buildPageModel(page: Partial<AtlasPage>): AtlasPage {
  return {
    id: page.id ?? `page-${Date.now()}`,
    workspaceId: page.workspaceId ?? "default",
    title: page.title ?? "Untitled Page",
    slug: page.slug ?? "untitled-page",
    type: page.type ?? "custom",
    layout: page.layout ?? { rows: [] },
    widgets: page.widgets ?? [],
    settings: page.settings ?? {},
    filters: page.filters ?? {},
    sorting: page.sorting ?? {},
    tabs: page.tabs ?? [],
    expandedSections: page.expandedSections ?? [],
    collapsedSections: page.collapsedSections ?? [],
    themeOverrides: page.themeOverrides ?? {},
    favoriteWidgets: page.favoriteWidgets ?? [],
    localPreferences: page.localPreferences ?? {},
    createdAt: page.createdAt ?? new Date().toISOString(),
    updatedAt: page.updatedAt ?? new Date().toISOString(),
  };
}

export function getVisibleWidgets(page: AtlasPage, roles: string[] = []): AtlasWidget[] {
  return page.widgets.filter((widget) => {
    const visibility = widget.visibility;

    if (visibility?.hidden) {
      return false;
    }

    if (visibility?.roles && visibility.roles.length > 0) {
      return roles.some((role) => visibility.roles?.includes(role));
    }

    return true;
  });
}

export function getWidgetDefinition(type: string) {
  return widgetRegistry.get(type);
}

interface PageRendererProps {
  page: AtlasPage;
  roles?: string[];
  children?: ReactNode;
}

export function PageRenderer({ page, roles = [], children }: PageRendererProps) {
  const visibleWidgets = useMemo(() => getVisibleWidgets(page, roles), [page, roles]);

  return (
    <div className="space-y-4">
      {visibleWidgets.map((widget) => (
        <section
          key={widget.id}
          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm"
        >
          <div className="mb-2 text-sm font-semibold text-[var(--text-primary)]">{widget.title}</div>
          <div className="text-sm text-[var(--text-secondary)]">
            {widget.type} · {widget.size.width}x{widget.size.height}
          </div>
        </section>
      ))}
      {children}
    </div>
  );
}
