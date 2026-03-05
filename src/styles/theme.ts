import { createTheme } from "@mui/material/styles";

// Global MUI theme.
// This is where we control typography, colors, spacing, and component defaults
// for the whole app from one place.
export const theme = createTheme({
  typography: {
    // Global font family used across Typography and most MUI components.
    fontFamily: [
      "Inter",
      "SF Pro Text",
      "SF Pro Display",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),

    // Default body text
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0",
    },

    // Slightly smaller body text
    body2: {
      fontSize: "0.95rem",
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: "0",
    },

    // Main page title style
    h1: {
      fontSize: "2rem",
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.03em",
    },

    h2: {
      fontSize: "1.6rem",
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.02em",
    },

    h3: {
      fontSize: "1.3rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },

    h4: {
      fontSize: "1.1rem",
      fontWeight: 700,
      lineHeight: 1.35,
    },

    h5: {
      fontSize: "1rem",
      fontWeight: 700,
      lineHeight: 1.4,
    },

    h6: {
      fontSize: "0.95rem",
      fontWeight: 700,
      lineHeight: 1.4,
    },

    // Good for small labels / helper text / muted UI text
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },

    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: 1.45,
      letterSpacing: "0.01em",
    },

    // Button typography defaults
    button: {
      fontSize: "0.95rem",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0",
    },

    // Captions / tiny text
    caption: {
      fontSize: "0.8rem",
      fontWeight: 400,
      lineHeight: 1.4,
      color: "#6b7280",
    },
  },

  components: {
    // Optional: make all buttons feel more polished by default.
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingLeft: 14,
          paddingRight: 14,
        },
      },
    },

    // Optional: slightly nicer default text field shape.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});