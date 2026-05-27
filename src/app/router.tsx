/* eslint-disable react-refresh/only-export-components --
   This is a route-config module: its primary export is the `router` object,
   and the gate components live here because they're only used by it. Fast
   Refresh will do a full reload on edits to this file, which is fine. */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FullScreenLoader from "../components/common/FullScreenLoader";

const App = lazy(() => import("./App"));
const Login = lazy(() => import("../pages/Login"));
const Landing = lazy(() => import("../pages/landing/Landing"));
const Home = lazy(() => import("../pages/Home"));
const LogToday = lazy(() => import("../pages/LogToday"));
const WeeklyLog = lazy(() => import("../pages/WeeklyLog"));
const Calendar = lazy(() => import("../pages/Calendar"));
const Profile = lazy(() => import("../pages/Profile"));
const PreferenceSectionPlaceholder = lazy(
  () => import("../pages/PreferenceSectionPlaceholder"),
);

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<FullScreenLoader />}>{node}</Suspense>;
}

function RootGate() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;

  if (!user) {
    if (location.pathname === "/") return withSuspense(<Landing />);
    return <Navigate to="/login" replace />;
  }

  return withSuspense(<App />);
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
        {withSuspense(<Login />)}
      </RequireGuest>
    ),
  },
  {
    path: "/",
    element: <RootGate />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: "today", element: withSuspense(<LogToday />) },
      { path: "day/:date", element: withSuspense(<LogToday />) },
      { path: "weekly", element: withSuspense(<WeeklyLog />) },
      { path: "calendar", element: withSuspense(<Calendar />) },
      { path: "profile", element: withSuspense(<Profile />) },
      {
        path: "preferences/profile",
        element: withSuspense(
          <PreferenceSectionPlaceholder
            title="Profile"
            subtitle="This section will handle name, avatar, and email settings."
          />,
        ),
      },
      {
        path: "preferences/notifications",
        element: withSuspense(
          <PreferenceSectionPlaceholder
            title="Notifications"
            subtitle="This section will handle the basic notification toggles."
          />,
        ),
      },
    ],
  },
]);
