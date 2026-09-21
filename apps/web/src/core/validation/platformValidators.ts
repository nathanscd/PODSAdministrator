import type { AtlasPage, AtlasWorkspace } from "../types/platform";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateWorkspace(workspace: AtlasWorkspace) {
  if (!isNonEmptyString(workspace.name)) {
    throw new Error("Workspace name is required.");
  }

  if (!isNonEmptyString(workspace.companyId)) {
    throw new Error("Workspace companyId is required.");
  }

  return true;
}

export function validatePage(page: AtlasPage) {
  if (!isNonEmptyString(page.title)) {
    throw new Error("Page title is required.");
  }

  if (!isNonEmptyString(page.slug)) {
    throw new Error("Page slug is required.");
  }

  return true;
}
