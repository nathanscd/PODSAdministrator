import type { AtlasWorkspace } from "../types/platform";
import { BaseRepository } from "./BaseRepository";

export class WorkspaceRepository extends BaseRepository<AtlasWorkspace> {
  constructor() {
    super("workspaces");
  }
}
