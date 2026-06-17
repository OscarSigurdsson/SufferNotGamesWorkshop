import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { apiGetMe, apiLogin, apiLogout, apiRegister } from '../api/auth';
import type { UserResponse } from '../api/auth';

interface AuthContextValue {
  user: UserResponse | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGetMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(username: string, password: string) {
    const u = await apiLogin(username, password);
    setUser(u);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  async function register(username: string, email: string, password: string) {
    const u = await apiRegister(username, email, password);
    setUser(u);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
