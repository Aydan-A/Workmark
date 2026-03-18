import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#7057f6",
      dark: "#5b45e2",
      light: "#8f7dff",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f6f4fd",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2340",
      secondary: "#6f768f",
    },
    divider: "#e9e4f7",
  },
  typography: {
    fontFamily: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"].join(","),
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: "0",
    },
    body2: {
      fontSize: "0.95rem",
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: "0",
    },
    h1: {
      fontSize: "1.95rem",
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "1.45rem",
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.15rem",
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "0",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: "0.01em",
    },
    button: {
      fontSize: "0.95rem",
      fontWeight: 500,
      textTransform: "none",
      letterSpacing: "0",
    },
    caption: {
      fontSize: "0.8rem",
      fontWeight: 400,
      lineHeight: 1.4,
      color: "#8b92ab",
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minWidth: 320,
        },
        "#root": {
          minHeight: "100vh",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 20px 50px rgba(67, 46, 140, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingLeft: 16,
          paddingRight: 16,
        },
        containedPrimary: {
          boxShadow: "0 18px 34px rgba(112, 87, 246, 0.2)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#ffffff",
        },
      },
    },
  },
});
