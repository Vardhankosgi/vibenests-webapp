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
  isLoading: boolean;
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
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken && !refreshToken) {
        clearStoredAuth();
        setUser(null);
        setSessionValidated(true);
        return;
      }

      const valid = await validateSessionWithBackend();
      if (cancelled) return;

      if (valid === null) {
        // Explicitly unauthorized or refresh failed
        clearStoredAuth();
        setUser(null);
      } else if (valid === 'network_error') {
        // Network issue, assume the stored user is still valid
        // user state is already initialized from loadUser()
      } else {
        // Successfully validated and refreshed
        if (valid.newAccessToken) {
          localStorage.setItem('accessToken', valid.newAccessToken);
        }
        // Save the latest user details from the server to local storage
        localStorage.setItem('authUser', JSON.stringify(valid.user));
        setUser(valid.user);
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
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading: !sessionValidated, saveSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
