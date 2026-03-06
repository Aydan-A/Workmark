import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Login from "../pages/Login";
import LogToday from "../pages/LogToday";
import WeeklyLog from "../pages/WeeklyLog";
import Calendar from "../pages/Calendar";
import { isAuthed } from "../features/auth/session";

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isAuthed() ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  return isAuthed() ? <Navigate to="/today" replace /> : <>{children}</>;
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
