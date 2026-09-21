import { db } from "../../firebase";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

export async function savePlatformDocument<T>(path: string, data: T, id?: string) {
  const ref = id ? doc(db, path, id) : doc(collection(db, path));
  await setDoc(ref, data as Record<string, unknown>, { merge: true });
  return ref.id;
}

export async function getPlatformDocument<T>(path: string, id: string) {
  const snap = await getDoc(doc(db, path, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as T) } as T & { id: string }) : null;
}

export async function listPlatformDocuments<T>(path: string) {
  const snap = await getDocs(collection(db, path));
  return snap.docs.map((item) => ({ id: item.id, ...(item.data() as T) })) as Array<T & { id: string }>;
}

export async function updatePlatformDocument<T>(path: string, id: string, data: Partial<T>) {
  const ref = doc(db, path, id);
  await updateDoc(ref, data as Record<string, unknown>);
}
