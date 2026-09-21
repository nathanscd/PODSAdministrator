import type { AtlasPage } from "../types/platform";
import { BaseRepository } from "./BaseRepository";

export class PageRepository extends BaseRepository<AtlasPage> {
  constructor() {
    super("pages");
  }
}
