import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./app/router";
import { AuthProvider } from "./hooks/useAuth";
import { queryClient } from "./lib/queryClient";
import { theme } from "./styles/theme";
import "./index.css";

// ThemeProvider makes the theme available across the entire app.
// CssBaseline resets browser styles so the app looks cleaner and more consistent.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
