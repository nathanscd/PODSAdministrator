import { savePlatformDocument, getPlatformDocument, listPlatformDocuments, updatePlatformDocument } from "../services/firebaseService";

export interface RepositoryResult<T> {
  id: string;
  data: T;
}

export abstract class BaseRepository<T extends { id?: string }> {
  constructor(protected readonly collectionPath: string) {}

  async create(data: T): Promise<RepositoryResult<T>> {
    const id = await savePlatformDocument<T>(this.collectionPath, data as T, data.id);
    return { id, data: { ...(data as T), id } };
  }

  async getById(id: string): Promise<RepositoryResult<T> | null> {
    const document = await getPlatformDocument<T>(this.collectionPath, id);

    if (!document) {
      return null;
    }

    return { id: document.id, data: document };
  }

  async list(): Promise<RepositoryResult<T>[]> {
    const documents = await listPlatformDocuments<T>(this.collectionPath);
    return documents.map((document) => ({ id: document.id, data: document }));
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    await updatePlatformDocument<T>(this.collectionPath, id, updates);
  }
}
