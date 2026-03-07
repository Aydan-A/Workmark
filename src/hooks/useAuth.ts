// src/hooks/useAuth.ts
// A small hook to expose current user + loading state.
// This is the cleanest way to protect routes.

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthChanges } from "../firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  // loading=true until Firebase tells us if user exists or not
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe returns an unsubscribe function
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}