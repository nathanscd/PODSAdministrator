import type { AtlasModuleDefinition } from "../types/platform";

const registry = new Map<string, AtlasModuleDefinition>();

export const moduleRegistry = {
  register(definition: AtlasModuleDefinition) {
    registry.set(definition.key, definition);
    return definition;
  },
  get(key: string) {
    return registry.get(key);
  },
  list() {
    return Array.from(registry.values());
  },
};

const defaultModules: AtlasModuleDefinition[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    description: "Core operating workspace for metrics and widgets.",
    enabledByDefault: true,
    routes: ["/"],
    widgets: ["kpi", "chart", "recent-documents"],
  },
  {
    key: "workspace",
    name: "Workspace",
    description: "Shared workspace context for companies and projects.",
    enabledByDefault: true,
    routes: ["/workspace"],
    widgets: ["tasks", "ai-assistant"],
  },
  {
    key: "settings",
    name: "Settings",
    description: "Configuration, permissions, and tenant preferences.",
    enabledByDefault: true,
    routes: ["/settings"],
    widgets: [],
  },
];

defaultModules.forEach((definition) => moduleRegistry.register(definition));
