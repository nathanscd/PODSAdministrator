import { 
  Auth, 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { User, Role } from 'shared';
import { userConverter } from '../converters';

export class AuthRepository {
  constructor(private auth: Auth, private db: Firestore) {}

  // Listen to Auth State Changes and retrieve corresponding Firestore user record
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const userDocRef = doc(this.db, 'users', firebaseUser.uid).withConverter(userConverter);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          callback(docSnap.data());
        } else {
          // Initialize user in Firestore if it doesn't exist yet
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Usuário',
            photoUrl: firebaseUser.photoURL || undefined,
            role: 'USER',
            bio: 'Sem descrição.',
            theme: 'light-orange',
            technicalSalesGroup: 'Unassigned',
            language: 'pt',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: firebaseUser.uid,
            updatedBy: firebaseUser.uid,
            isDeleted: false,
          };

          await setDoc(userDocRef, newUser);
          callback(newUser);
        }
      } catch (error) {
        console.error('Error fetching auth user profile:', error);
        callback(null);
      }
    });
  }

  // Sign In
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  // Sign Up
  async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // Update Firebase Auth profile
    await firebaseUpdateProfile(credential.user, { displayName });
    
    // Initialize Firestore profile document
    const userDocRef = doc(this.db, 'users', credential.user.uid).withConverter(userConverter);
    const newUser: User = {
      id: credential.user.uid,
      email,
      displayName,
      role: 'USER',
      bio: 'Sem descrição.',
      theme: 'light-orange',
      technicalSalesGroup: 'Unassigned',
      language: 'pt',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: credential.user.uid,
      updatedBy: credential.user.uid,
      isDeleted: false,
    };
    await setDoc(userDocRef, newUser);

    return credential.user;
  }

  // Sign Out
  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  // Password Reset
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  // Update Profile document
  async updateUserProfile(userId: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
    const userDocRef = doc(this.db, 'users', userId).withConverter(userConverter);
    
    // If update profile contains display name or photo, update Firebase Auth user directly
    if (this.auth.currentUser && (data.displayName || data.photoUrl)) {
      await firebaseUpdateProfile(this.auth.currentUser, {
        displayName: data.displayName || this.auth.currentUser.displayName,
        photoURL: data.photoUrl || this.auth.currentUser.photoURL
      });
    }

    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date()
    });
  }
}
