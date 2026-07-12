import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import type { Employee } from '@/types';
import { api } from '@/services/api';

interface AuthContextValue {
  user: Employee | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkUserLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const [user, setUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async () => {
    if (!clerkUserLoaded) return;

    if (isSignedIn && clerkUser) {
      try {
        // Try to get a Clerk session token
        // getToken() may return null if no JWT template is configured —
        // in that case we fall through to the axios interceptor which
        // will use whatever token is already stored.
        let token = await getToken();

        if (!token) {
          // Clerk returned no token — try fetching a fresh one with a small delay
          await new Promise((r) => setTimeout(r, 500));
          token = await getToken();
        }

        if (token) {
          localStorage.setItem('ecosphere_token', token);
        }

        // Now call /auth/me — the backend will verify the token
        const backendUser = await api.getCurrentUser();
        setUser(backendUser);
      } catch (err: any) {
        console.error('[AuthContext] Failed to sync session:', err?.message ?? err);
        // If the /auth/me call fails, clear auth state
        setUser(null);
        localStorage.removeItem('ecosphere_token');
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      localStorage.removeItem('ecosphere_token');
      setLoading(false);
    }
  }, [isSignedIn, clerkUser, clerkUserLoaded, getToken]);

  // Run on mount + whenever Clerk session changes
  useEffect(() => {
    syncSession();
  }, [syncSession]);

  // Refresh token every 55 minutes (Clerk tokens expire after 60 min)
  useEffect(() => {
    if (!isSignedIn) return;
    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (token) {
          localStorage.setItem('ecosphere_token', token);
        }
      } catch (e) {
        console.warn('[AuthContext] Token refresh failed:', e);
      }
    }, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  function logout() {
    setUser(null);
    localStorage.removeItem('ecosphere_token');
    if (isSignedIn) signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading: !clerkUserLoaded || loading,
        logout,
        refreshToken: syncSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
