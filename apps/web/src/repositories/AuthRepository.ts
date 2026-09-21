import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { TenantUser, Company, Workspace, Department, Team } from "shared/types/auth";

export class AuthRepository {
  async getUser(uid: string): Promise<TenantUser | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as TenantUser;
    }
    return null;
  }

  async saveUser(user: TenantUser): Promise<void> {
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, user, { merge: true });
  }

  async updateUser(uid: string, data: Partial<TenantUser>): Promise<void> {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, data);
  }

  async getCompany(companyId: string): Promise<Company | null> {
    const docRef = doc(db, "companies", companyId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Company;
    }
    return null;
  }

  async getWorkspacesForCompany(companyId: string): Promise<Workspace[]> {
    const q = query(collection(db, "workspaces"), where("companyId", "==", companyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workspace));
  }

  async getDepartmentsForCompany(companyId: string): Promise<Department[]> {
    const q = query(collection(db, "departments"), where("companyId", "==", companyId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Department));
  }

  async getTeamsForDepartment(departmentId: string): Promise<Team[]> {
    const q = query(collection(db, "teams"), where("departmentId", "==", departmentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
  }
}

export const authRepository = new AuthRepository();
