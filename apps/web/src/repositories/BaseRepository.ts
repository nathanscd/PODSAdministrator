import { db } from "../firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  serverTimestamp,
  QueryConstraint
} from "firebase/firestore";
import { BaseEntity } from "shared/types";

export abstract class BaseRepository<T extends BaseEntity> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collectionRef() {
    return collection(db, this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as T;
    }
    return null;
  }

  async list(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(this.collectionRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...data,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.update(id, { isDeleted: true, deletedAt: new Date() } as unknown as Partial<T>);
  }

  async hardDelete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
