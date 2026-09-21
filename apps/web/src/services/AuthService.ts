import { auth } from "../firebase";
import { 
  signOut as fbSignOut, 
  updateProfile as fbUpdateProfile,
  User as FirebaseUser 
} from "firebase/auth";
import { AuthRepository, authRepository } from "../repositories/AuthRepository";
import { TenantUser } from "shared/types/auth";

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  async getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<TenantUser> {
    let profile = await this.repo.getUser(firebaseUser.uid);
    if (!profile) {
      profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "Usuário",
        photoURL: firebaseUser.photoURL || "",
        photoUrl: firebaseUser.photoURL || "",
        role: "Membro",
        bio: "Sem descrição.",
        theme: "light-orange",
        technicalSalesGroup: "Unassigned",
        isAdmin: false,
        language: "pt",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: firebaseUser.uid,
        updatedBy: firebaseUser.uid
      };
      await this.repo.saveUser(profile);
    }
    return profile;
  }

  async updateUserProfile(uid: string, data: Partial<TenantUser>): Promise<void> {
    if (auth.currentUser && (data.displayName || data.photoURL || data.photoUrl)) {
      await fbUpdateProfile(auth.currentUser, {
        displayName: data.displayName || auth.currentUser.displayName || "",
        photoURL: data.photoURL || data.photoUrl || auth.currentUser.photoURL || ""
      });
    }
    await this.repo.updateUser(uid, { ...data, updatedAt: new Date() });
  }

  async logout(): Promise<void> {
    await fbSignOut(auth);
  }
}

export const authService = new AuthService();
