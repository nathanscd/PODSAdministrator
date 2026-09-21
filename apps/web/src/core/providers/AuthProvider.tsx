import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth as useLegacyAuth } from "../../contexts/AuthContext";

interface AtlasAuthContextValue {
  user: unknown;
  loading: boolean;
  isAdmin: boolean;
  language: string;
  userGroup: string | undefined;
  updateUserProfile: (data: Partial<Record<string, unknown>>) => Promise<void>;
  changeTheme: (theme: string) => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
}

const AtlasAuthContext = createContext<AtlasAuthContextValue>({} as AtlasAuthContextValue);

export function AtlasAuthProvider({ children }: { children: ReactNode }) {
  const legacyAuth = useLegacyAuth();
  const [loading] = useState(legacyAuth.loading);

  const value = useMemo(
    () => ({
      user: legacyAuth.user,
      loading,
      isAdmin: legacyAuth.isAdmin,
      language: legacyAuth.language,
      userGroup: legacyAuth.userGroup,
      updateUserProfile: legacyAuth.updateUserProfile as (data: Partial<Record<string, unknown>>) => Promise<void>,
      changeTheme: legacyAuth.changeTheme as (theme: string) => Promise<void>,
      setLanguage: legacyAuth.setLanguage,
    }),
    [legacyAuth, loading],
  );

  return <AtlasAuthContext.Provider value={value}>{children}</AtlasAuthContext.Provider>;
}

export const useAtlasAuth = () => useContext(AtlasAuthContext);
