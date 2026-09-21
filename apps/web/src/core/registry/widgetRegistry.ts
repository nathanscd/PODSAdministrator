import type { AtlasWidget, AtlasWidgetDefinition } from "../types/platform";

const registry = new Map<string, AtlasWidgetDefinition>();

export const widgetRegistry = {
  register(definition: AtlasWidgetDefinition) {
    registry.set(definition.type, definition);
    return definition;
  },
  get(type: string) {
    return registry.get(type);
  },
  list() {
    return Array.from(registry.values());
  },
  createWidget(type: string, overrides: Partial<AtlasWidget> = {}) {
    const definition = registry.get(type);

    if (!definition) {
      return null;
    }

    return {
      id: overrides.id ?? `${type}-${Date.now()}`,
      type,
      title: overrides.title ?? definition.displayName,
      position: overrides.position ?? { x: 0, y: 0 },
      size: overrides.size ?? definition.defaultSize,
      minimumSize: overrides.minimumSize ?? definition.minimumSize,
      maximumSize: overrides.maximumSize ?? definition.maximumSize,
      permissions: overrides.permissions ?? [],
      configuration: overrides.configuration ?? {},
      metadata: overrides.metadata ?? {},
      visibility: overrides.visibility ?? { hidden: false },
      version: overrides.version ?? 1,
      dataBinding: overrides.dataBinding,
      createdAt: overrides.createdAt ?? new Date().toISOString(),
      updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    } as AtlasWidget;
  },
};

const defaultDefinitions: AtlasWidgetDefinition[] = [
  {
    type: "kpi",
    displayName: "KPI Widget",
    description: "Displays compact business metrics.",
    defaultSize: { width: 3, height: 2 },
    minimumSize: { width: 2, height: 2 },
    maximumSize: { width: 6, height: 4 },
  },
  {
    type: "chart",
    displayName: "Chart Widget",
    description: "Visualizes collections of data.",
    defaultSize: { width: 4, height: 3 },
    minimumSize: { width: 3, height: 2 },
    maximumSize: { width: 8, height: 6 },
  },
  {
    type: "recent-documents",
    displayName: "Recent Documents",
    description: "Shows recently touched documents.",
    defaultSize: { width: 4, height: 3 },
    minimumSize: { width: 3, height: 2 },
    maximumSize: { width: 6, height: 4 },
  },
  {
    type: "tasks",
    displayName: "Tasks Widget",
    description: "Displays task lists for the active workspace.",
    defaultSize: { width: 3, height: 3 },
    minimumSize: { width: 2, height: 2 },
    maximumSize: { width: 6, height: 5 },
  },
  {
    type: "ai-assistant",
    displayName: "AI Assistant",
    description: "Provides an extension point for AI workflows.",
    defaultSize: { width: 4, height: 4 },
    minimumSize: { width: 3, height: 2 },
    maximumSize: { width: 8, height: 6 },
  },
];

defaultDefinitions.forEach((definition) => widgetRegistry.register(definition));
