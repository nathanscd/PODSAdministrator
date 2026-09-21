import { PageRepository } from "../repositories/pageRepository";
import { WorkspaceRepository } from "../repositories/workspaceRepository";
import { mapLegacyPageToAtlasPage, mapLegacyWorkspaceToAtlasWorkspace } from "../types/compat";
import type { AtlasPage, AtlasWorkspace } from "../types/platform";

export class PlatformService {
  private readonly pageRepository = new PageRepository();
  private readonly workspaceRepository = new WorkspaceRepository();

  async createWorkspace(workspace: AtlasWorkspace) {
    return this.workspaceRepository.create(workspace);
  }

  async getWorkspace(id: string) {
    const result = await this.workspaceRepository.getById(id);
    return result ? { ...result, data: mapLegacyWorkspaceToAtlasWorkspace(result.data as Record<string, unknown>) } : null;
  }

  async listWorkspaces() {
    return this.workspaceRepository.list();
  }

  async createPage(page: AtlasPage) {
    return this.pageRepository.create(page);
  }

  async getPage(id: string) {
    const result = await this.pageRepository.getById(id);
    return result ? { ...result, data: mapLegacyPageToAtlasPage(result.data as Record<string, unknown>) } : null;
  }

  async listPages() {
    return this.pageRepository.list();
  }

  async updatePage(id: string, updates: Partial<AtlasPage>) {
    await this.pageRepository.update(id, updates);
  }
}

export const platformService = new PlatformService();
