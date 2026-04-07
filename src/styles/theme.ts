import { createTheme } from "@mui/material/styles";

const appFontFamily = ["Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"].join(",");

export const theme = createTheme({
  palette: {
    primary: {
      main: "#7057f6",
      dark: "#5640dc",
      light: "#9a8cff",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1f2340",
    },
    background: {
      default: "#f7f4ff",
      paper: "rgba(255,255,255,0.88)",
    },
    text: {
      primary: "#1f2340",
      secondary: "#6f768f",
    },
    divider: "rgba(124, 106, 214, 0.16)",
  },
  typography: {
    fontFamily: appFontFamily,
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
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.02,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontSize: "1.15rem",
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: "-0.01em",
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
    borderRadius: 20,
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
          boxShadow: "0 24px 70px rgba(73, 52, 146, 0.08)",
          backdropFilter: "blur(14px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          paddingLeft: 18,
          paddingRight: 18,
        },
        containedPrimary: {
          boxShadow: "0 18px 34px rgba(112, 87, 246, 0.2)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.96)",
        },
      },
    },
  },
});
