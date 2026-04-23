import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { syncCurrentUserIdentity } from "../features/profile/profile.api";
import { useAuth } from "../hooks/useAuth";

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    void syncCurrentUserIdentity(user).catch((error) => {
      console.error("Failed to sync user identity:", error);
    });
  }, [user]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
