import { createTheme } from "@mui/material/styles";

const appFontFamily = ["Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"].join(",");

const BRAND_PURPLE_RGB = "112, 87, 246";
const brandAlpha = (a: number) => `rgba(${BRAND_PURPLE_RGB}, ${a})`;

// Custom palette tokens. Reference via sx ("ink.muted", "glass.panel", etc.).
declare module "@mui/material/styles" {
  interface Palette {
    ink: {
      strong: string; base: string; muted: string; faint: string; disabled: string;
      label: string; labelStrong: string; labelMuted: string; labelDark: string; unit: string; subtle: string; soft: string; dark: string;
    };
    glass: { panel: string; panelStrong: string; panelOpaque: string; panelHover: string; subtle: string; border: string; tint: string };
    scrim: { light: string; medium: string; heavy: string };
    accentPurple: { deep: string; bright: string };
    brand: { alpha: (a: number) => string };
  }
  interface PaletteOptions {
    ink?: Partial<Palette["ink"]>;
    glass?: Partial<Palette["glass"]>;
    scrim?: Partial<Palette["scrim"]>;
    accentPurple?: Partial<Palette["accentPurple"]>;
    brand?: Partial<Palette["brand"]>;
  }
}

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
      default: "#E4DFEF",
      paper: "rgba(255,255,255,0.55)",
    },
    text: {
      primary: "#1f2340",
      secondary: "#6f768f",
    },
    divider: "rgba(124, 106, 214, 0.16)",
    // Neutral scale.
    grey: {
      50: "#f5f5f8",
      100: "#eef0f3",
      200: "#d1d5db",
      300: "#b8bcd0",
      400: "#94a3b8",
      500: "#8b92ab",
      600: "#6d7394",
      700: "#545c88",
      800: "#2f3360",
      900: "#111827",
    },
    // Text/ink shades (lower group are one-off shades from components).
    ink: {
      strong: "#111827",
      base: "#1f2340",
      muted: "#6f768f",
      faint: "#8b92ab",
      disabled: "#b8bcd0",
      label: "#6d7394",
      labelStrong: "#525a88",
      labelMuted: "#8f96ad",
      labelDark: "#545c88",
      unit: "#8a90ab",
      subtle: "#77809b",
      soft: "#8B8B9E",
      dark: "#1A1A2E",
    },
    // Purple accents distinct from the brand primary.
    accentPurple: {
      deep: "#584fd1",
      bright: "#9B8FFF",
    },
    // Frosted-glass surface tokens used by cards/panels.
    glass: {
      panel: "rgba(255,255,255,0.55)",
      panelStrong: "rgba(255,255,255,0.8)",
      panelOpaque: "rgba(255,255,255,0.92)",
      panelHover: "rgba(255,255,255,0.62)",
      subtle: "rgba(255,255,255,0.32)",
      border: "rgba(255,255,255,0.8)",
      tint: brandAlpha(0.08),
    },
    // Dark overlays for legibility over images/media.
    scrim: {
      light: "rgba(0,0,0,0.35)",
      medium: "rgba(0,0,0,0.45)",
      heavy: "rgba(0,0,0,0.65)",
    },
    // Helper for brand purple at arbitrary alpha.
    brand: {
      alpha: brandAlpha,
    },
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
      fontWeight: 800,
      lineHeight: 1.02,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontSize: "1.15rem",
      fontWeight: 700,
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
      fontWeight: 600,
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
          backgroundColor: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(112, 87, 246, 0.08)",
          borderRadius: 24,
          backgroundImage: "none",
        },
        outlined: {
          border: "1px solid rgba(255,255,255,0.8)",
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
