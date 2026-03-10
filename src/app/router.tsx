import { createBrowserRouter, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import App from "./App";
import Login from "../pages/Login";
import LogToday from "../pages/LogToday";
import WeeklyLog from "../pages/WeeklyLog";
import Calendar from "../pages/Calendar";
import { useAuth } from "../hooks/useAuth";

// File purpose:
// Central route map + auth guards.
// - RequireAuth protects app routes.
// - RequireGuest protects login route.
// - Both guards wait for Firebase auth bootstrap to avoid redirect flicker.

// RequireAuth:
// - While auth state is loading: show full-screen progress spinner.
// - If user exists: render protected children.
// - If no user: redirect to /login.
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

// RequireGuest:
// - While auth state is loading: show full-screen progress spinner.
// - If user exists: redirect to /today.
// - If no user: render guest-only children (login page).
function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Navigate to="/today" replace /> : <>{children}</>;
}

// Route map:
// - /login: guest-only login page.
// - /: authenticated app shell.
//   - index: redirects to /today.
//   - /today, /weekly, /calendar: authenticated pages.
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
