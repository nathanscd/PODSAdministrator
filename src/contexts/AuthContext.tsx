import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "../firebase"; // Certifique-se que seu firebase.ts exporta 'auth' e 'db'
import { onAuthStateChanged, User as FirebaseUser, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

type Theme = "light-orange" | "light-rosa" | "light-roxo" | "light-vermelho" | "dark-orange" | "dark-rosa" | "dark-roxo" | "dark-vermelho";

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: string;
  bio: string;
  theme: Theme;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changeTheme: (theme: Theme) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Aplica o tema ao HTML
  useEffect(() => {
    if (user?.theme) {
      document.documentElement.setAttribute("data-theme", user.theme);
    } else {
      document.documentElement.setAttribute("data-theme", "light-orange");
    }
  }, [user?.theme]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({ uid: firebaseUser.uid, ...docSnap.data() } as UserProfile);
        } else {
          // Cria perfil inicial se não existir
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Usuário",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || "",
            role: "Membro",
            bio: "Sem descrição.",
            theme: "light-orange"
          };
          await setDoc(docRef, newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    // Atualiza Auth do Firebase (apenas nome e foto)
    if (data.displayName || data.photoURL) {
      await updateProfile(auth.currentUser!, {
        displayName: data.displayName || user.displayName,
        photoURL: data.photoURL || user.photoURL
      });
    }

    // Atualiza Firestore
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, data);
    setUser({ ...user, ...data });
  };

  const changeTheme = async (theme: Theme) => {
    if (user) {
      updateUserProfile({ theme });
    } else {
      // Se não estiver logado, muda apenas visualmente
      document.documentElement.setAttribute("data-theme", theme);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUserProfile, changeTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);