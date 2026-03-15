import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Login from "../pages/Login";
import LogToday from "../pages/LogToday";
import WeeklyLog from "../pages/WeeklyLog";
import Calendar from "../pages/Calendar";
import { useAuth } from "../hooks/useAuth";
import FullScreenLoader from "../components/common/FullScreenLoader";


function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// RequireGuest:
// - While auth state is loading: show full-screen progress spinner.
// - If user exists: redirect to /today.
// - If no user: render guest-only children (login page).
function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  return user ? <Navigate to="/today" replace /> : <>{children}</>;
}


export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <RequireGuest>
        <Login />
      </RequireGuest>
    ),
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: "today", element: <LogToday /> },
      { path: "weekly", element: <WeeklyLog /> },
      { path: "calendar", element: <Calendar /> },
    ],
  },
]);
