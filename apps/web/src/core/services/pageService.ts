import type { AtlasPage } from "../types/platform";
import { savePlatformDocument, updatePlatformDocument } from "./firebaseService";

export async function persistPage(page: AtlasPage) {
  return savePlatformDocument<AtlasPage>("pages", page, page.id);
}

export async function updatePage(pageId: string, updates: Partial<AtlasPage>) {
  await updatePlatformDocument<AtlasPage>("pages", pageId, updates);
}
