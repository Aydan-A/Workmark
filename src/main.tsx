import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { router } from "./app/router";
import { AuthProvider } from "./hooks/useAuth";
import { theme } from "./styles/theme";
import "./index.css";

// ThemeProvider makes the theme available across the entire app.
// CssBaseline resets browser styles so the app looks cleaner and more consistent.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
