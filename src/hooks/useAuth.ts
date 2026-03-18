// A small hook to expose current user and loading state.
// This is the cleanest way to protect routes.

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthChanges } from "../firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}