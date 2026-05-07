import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasStoredAuthSession() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("firebase:authUser:")) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLandingAnonymous =
      typeof window !== "undefined" &&
      window.location.pathname === "/" &&
      !hasStoredAuthSession();

    if (isLandingAnonymous) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    import("../firebase/auth").then(({ subscribeToAuthChanges }) => {
      if (cancelled) return;
      unsubscribe = subscribeToAuthChanges((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [loading, user]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
