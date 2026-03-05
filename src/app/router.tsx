import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Login from "../pages/Login";
import LogToday from "../pages/LogToday";
import WeeklyLog from "../pages/WeeklyLog";
import Calendar from "../pages/Calendar";

function RequireAuth({ children }: { children: React.ReactNode }) {
  // TODO: connect Firebase auth state
  const isAuthed = true;
  return isAuthed ? <>{children}</> : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
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