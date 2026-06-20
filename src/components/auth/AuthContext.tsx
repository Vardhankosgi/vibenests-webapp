import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { clearStoredAuth, validateSessionWithBackend } from '@/lib/session';

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  saveSession: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredAccessToken(): string {
  try {
    return localStorage.getItem('accessToken') || '';
  } catch {
    return '';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [sessionValidated, setSessionValidated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const accessToken = getStoredAccessToken();
      if (!accessToken || !user) {
        setSessionValidated(true);
        return;
      }

      const valid = await validateSessionWithBackend(accessToken);
      if (cancelled) return;

      if (!valid) {
        clearStoredAuth();
        setUser(null);
      } else {
        // keep current user data, but ensure role matches the backend
        if (user.role !== valid.role) {
          setUser((prev) => (prev ? { ...prev, role: valid.role } : prev));
        }
      }

      setSessionValidated(true);
    }

    validate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSession = useCallback((accessToken: string, refreshToken: string, u: AuthUser) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('authUser', JSON.stringify(u));
    setUser(u);
    setSessionValidated(true);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredAuth();
    setUser(null);
    setSessionValidated(true);
  }, []);

  const isAuthenticated = useMemo(() => {
    // Do not treat localStorage as authenticated until validated against backend once.
    if (!sessionValidated) return false;
    if (!user) return false;
    return true;
  }, [sessionValidated, user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, saveSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
