import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  email: string;
  role: string;
  name?: string;
  fullName?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthReady: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = "serviceease_auth_user";

const getStoredUser = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isAuthReady] = useState(true);

  const login = (userData: AuthUser) => {
    const normalizedUser = {
      ...userData,
      role: userData.role?.toLowerCase() ?? "",
    };
    setUser(normalizedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
