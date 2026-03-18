import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Login from "../pages/Login";
import Home from "../pages/Home";
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

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  return user ? <Navigate to="/" replace /> : <>{children}</>;
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
      { index: true, element: <Home /> },
      { path: "today", element: <LogToday /> },
      { path: "weekly", element: <WeeklyLog /> },
      { path: "calendar", element: <Calendar /> },
    ],
  },
]);
