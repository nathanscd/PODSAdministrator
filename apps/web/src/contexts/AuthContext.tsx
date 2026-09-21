import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { TenantUser, Company, Workspace, Department, Team, Theme } from "shared/types/auth";
import { authService } from "../services/AuthService";
import { authRepository } from "../repositories/AuthRepository";

interface AuthContextType {
  user: TenantUser | null;
  loading: boolean;
  isAdmin: boolean;
  language: string;
  userGroup: string | undefined;
  company: Company | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  departments: Department[];
  teams: Team[];
  updateUserProfile: (data: Partial<TenantUser>) => Promise<void>;
  changeTheme: (theme: Theme) => void;
  setLanguage: (lang: string) => Promise<void>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const themeToApply = user?.theme || "light-orange";
    document.documentElement.setAttribute("data-theme", themeToApply);
  }, [user?.theme]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const profile = await authService.getOrCreateUserProfile(firebaseUser);
          setUser(profile);

          if (profile.companyId) {
            const comp = await authRepository.getCompany(profile.companyId);
            setCompany(comp);

            const work = await authRepository.getWorkspacesForCompany(profile.companyId);
            setWorkspaces(work);
            if (work.length > 0 && !activeWorkspace) {
              setActiveWorkspace(work[0]);
            }

            const depts = await authRepository.getDepartmentsForCompany(profile.companyId);
            setDepartments(depts);

            if (depts.length > 0) {
              const tms = await authRepository.getTeamsForDepartment(depts[0].id);
              setTeams(tms);
            }
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
        }
      } else {
        setUser(null);
        setCompany(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
        setDepartments([]);
        setTeams([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateUserProfile = async (data: Partial<TenantUser>) => {
    if (!user) return;
    await authService.updateUserProfile(user.uid, data);
    setUser((prev) => prev ? { ...prev, ...data } : null);
  };

  const changeTheme = async (theme: Theme) => {
    await updateUserProfile({ theme });
  };

  const setLanguage = async (lang: string) => {
    await updateUserProfile({ language: lang });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAdmin = user?.isAdmin === true || user?.role === "ADMIN";
  const userGroup = user?.technicalSalesGroup;
  const language = user?.language || "pt";

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      userGroup, 
      company,
      workspaces,
      activeWorkspace,
      departments,
      teams,
      updateUserProfile, 
      changeTheme, 
      language,
      setLanguage,
      setActiveWorkspace,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
