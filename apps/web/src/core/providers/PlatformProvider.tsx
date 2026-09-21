import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import "../../modules";
import { buildPageModel } from "../engine/pageEngine";
import { moduleRegistry } from "../registry/moduleRegistry";
import { platformService } from "../services/platformService";
import { validatePage, validateWorkspace } from "../validation/platformValidators";
import type { AtlasModuleDefinition, AtlasPage, AtlasWorkspace } from "../types/platform";

interface PlatformContextValue {
  workspace: AtlasWorkspace | null;
  setWorkspace: (workspace: AtlasWorkspace | null) => void;
  modules: AtlasModuleDefinition[];
  registerModule: (module: AtlasModuleDefinition) => void;
  pageBlueprints: Record<string, AtlasPage>;
  registerPageBlueprint: (page: AtlasPage) => void;
  createWorkspace: (workspace: AtlasWorkspace) => Promise<unknown>;
  createPage: (page: AtlasPage) => Promise<unknown>;
  getPage: (pageId: string) => Promise<unknown>;
}

const PlatformContext = createContext<PlatformContextValue>({} as PlatformContextValue);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<AtlasWorkspace | null>(null);
  const [modules, setModules] = useState<AtlasModuleDefinition[]>(() => moduleRegistry.list());
  const [pageBlueprints, setPageBlueprints] = useState<Record<string, AtlasPage>>({});

  const registerModule = (module: AtlasModuleDefinition) => {
    setModules((current) => (current.some((item) => item.key === module.key) ? current : [...current, module]));
  };

  const registerPageBlueprint = (page: AtlasPage) => {
    setPageBlueprints((current) => ({ ...current, [page.slug]: buildPageModel(page) }));
  };

  const createWorkspace = async (workspace: AtlasWorkspace) => {
    validateWorkspace(workspace);
    return platformService.createWorkspace(workspace);
  };

  const createPage = async (page: AtlasPage) => {
    validatePage(page);
    const created = await platformService.createPage(page);
    registerPageBlueprint(page);
    return created;
  };

  const getPage = async (pageId: string) => platformService.getPage(pageId);

  const value = useMemo(
    () => ({ workspace, setWorkspace, modules, registerModule, pageBlueprints, registerPageBlueprint, createWorkspace, createPage, getPage }),
    [workspace, modules, pageBlueprints],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export const usePlatform = () => useContext(PlatformContext);
